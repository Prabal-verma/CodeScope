// Function to get selected code using Chrome extension messaging
async function getSelectedCodeFromPage() {
  return new Promise((resolve, reject) => {
    // Get the active tab
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (!tabs[0]) {
        reject(new Error('No active tab found'));
        return;
      }

      const tab = tabs[0];
      console.log("Active tab URL:", tab.url);

      // Check if we're on GitHub
      if (!tab.url.includes('github.com')) {
        reject(new Error('Please navigate to a GitHub page first'));
        return;
      }

      // Try to inject content script if it's not already there
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => {
          // Return selected text
          return window.getSelection().toString();
        }
      }, (results) => {
        if (chrome.runtime.lastError) {
          reject(new Error(`Script injection failed: ${chrome.runtime.lastError.message}`));
          return;
        }

        if (results && results[0] && results[0].result) {
          const selectedText = results[0].result.trim();
          if (selectedText) {
            resolve(selectedText);
          } else {
            reject(new Error('No text selected. Please select some code on the GitHub page first.'));
          }
        } else {
          reject(new Error('No text selected. Please select some code on the GitHub page first.'));
        }
      });
    });
  });
}

document.getElementById("scan-button").addEventListener("click", async () => {
  console.log("Scan button clicked");
  const resultDiv = document.getElementById("result");
  
  try {
    // First test: Check if we can get selected code
    resultDiv.innerText = "🔄 Getting selected code...";
    const selectedCode = await getSelectedCodeFromPage();
    console.log("Selected code:", selectedCode.substring(0, 100));
    
    // Second test: Check if background script responds
    resultDiv.innerText = "🔄 Connecting to background script...";
    
    const response = await new Promise((resolve, reject) => {
      console.log("Sending message to background script");
      chrome.runtime.sendMessage({
        action: "analyzeCode",
        code: selectedCode
      }, (response) => {
        console.log("Background script response:", response);
        if (chrome.runtime.lastError) {
          console.error("Runtime error:", chrome.runtime.lastError);
          reject(new Error(chrome.runtime.lastError.message));
        } else if (response && response.error) {
          reject(new Error(response.error));
        } else if (response && response.result) {
          resolve(response);
        } else {
          reject(new Error("No response from background script"));
        }
      });
    });

    resultDiv.innerText = response.result;
    
  } catch (err) {
    console.error("❌ Error:", err);
    resultDiv.innerText = `❌ Failed to analyze code.\n\nError: ${err.message}`;
  }
});

document.addEventListener("DOMContentLoaded", () => {
  const resultBox = document.getElementById("result");
  const copyButton = document.getElementById("copy-button");
  const downloadButton = document.getElementById("download-button");

  copyButton.addEventListener("click", () => {
    const text = resultBox.innerText;
    navigator.clipboard.writeText(text).then(() => {
      copyButton.innerText = "✅ Copied!";
      setTimeout(() => (copyButton.innerText = "📋 Copy"), 1500);
    });
  });

  downloadButton.addEventListener("click", () => {
    const text = resultBox.innerText;
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "scan-result.txt";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  });
});

function setLoadingState(isLoading) {
  const btn = document.getElementById("scan-button");
  btn.disabled = isLoading;
  btn.textContent = isLoading ? "Scanning..." : "Scan Now";
}

function displayResult(resultText, codeText) {
  const resultDiv = document.getElementById("result");
  const scannedCodeBlock = document.getElementById("scanned-code");

  // Show the result with severity badges
  const formattedResult = formatResultWithSeverityBadges(resultText);
  resultDiv.innerHTML = formattedResult;

  // Show the scanned code (with escaping HTML)
  scannedCodeBlock.textContent = codeText;

  // Trigger Prism to highlight it
  Prism.highlightElement(scannedCodeBlock);
}

document.getElementById("scan-button").addEventListener("click", () => {
  setLoadingState(true);
  chrome.tabs.executeScript({
    code: "window.getSelection().toString();"
  }, selection => {
    const code = selection[0] || "";
    chrome.runtime.sendMessage({ action: "analyzeCode", code }, response => {
      setLoadingState(false);
      if (response?.error) {
        document.getElementById("result").textContent = "❌ " + response.error;
        return;
      }

      displayResult(response.result, code);
    });
  });
});



console.log("popup.js loaded");