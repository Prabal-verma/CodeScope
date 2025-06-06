// Content script for GitHub pages
console.log("Content script loaded on:", window.location.href);

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("Content script received message:", request);
  
  if (request.action === "getSelectedCode") {
    const selection = window.getSelection().toString();
    console.log("Selected text length:", selection.length);
    sendResponse({ code: selection });
  }
  
  return true; // Keep message channel open for async response
});

// Also add a fallback function to get code from GitHub code blocks
function getCodeFromGitHub() {
  // Try to get selected text first
  const selection = window.getSelection().toString().trim();
  if (selection) return selection;
  
  // If no selection, try to get code from GitHub code blocks
  const codeBlocks = document.querySelectorAll('.highlight pre, .blob-code-inner, code');
  if (codeBlocks.length > 0) {
    return codeBlocks[0].textContent.trim();
  }
  
  return '';
}