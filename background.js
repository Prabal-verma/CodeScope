// Background script to handle API calls
console.log("🚀 Background script loaded and ready");

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("📨 Background received message:", request);
  
  if (request.action === "analyzeCode") {
    console.log("🔍 Starting code analysis...");
    
    // Test response first
    if (request.code.length < 10) {
      sendResponse({ error: "Selected code is too short. Please select more code." });
      return true;
    }
    
    // Call the API function
    analyzeCodeWithClaude(request.code)
      .then(result => {
        console.log("✅ Analysis complete");
        sendResponse({ result });
      })
      .catch(error => {
        console.error("❌ Analysis failed:", error);
        sendResponse({ error: error.message });
      });
    
    // Return true to indicate async response
    return true;
  }
  
  // Unknown action
  console.log("❓ Unknown action:", request.action);
  sendResponse({ error: "Unknown action" });
  return true;
});

async function analyzeCodeWithClaude(code) {
  console.log("🤖 Calling Claude API with code length:", code.length);
  
  const apiKey = "YOUR_API_KEY"; // Replace with your actual API key
  
  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-3-sonnet-20240229",
        max_tokens: 4000,
        messages: [{
          role: "user",
          content: `Analyze this code for security vulnerabilities (OWASP Top 10, SANS 25, business logic). 
Provide a clear, concise report with these sections:

SUMMARY:
- List vulnerabilities found (name only)

IMPACT:
- For each vulnerability, briefly explain what risk it poses (1-2 sentences)

SOLUTION:
- For each, give a simple, practical fix or prevention tip with an example if applicable

Format as:

SUMMARY:
1. [Vuln Name]
2. [Vuln Name]

IMPACT:
1. [Explanation]

SOLUTION:
1. [Fix]

Keep the entire response concise and easy to scan.

Code to analyze:
\`\`\`
${code}
\`\`\``
        }]
      })
    });

    console.log("📡 API Response status:", response.status);
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error("API Error:", errorData);
      throw new Error(`API Error (${response.status}): ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    console.log("📄 API Response received:", data);
    
    if (!data?.content?.[0]?.text) {
      console.error("Invalid API response format:", data);
      throw new Error('Invalid response format from Claude API');
    }

    return data.content[0].text;
    
  } catch (error) {
    console.error("🚨 Claude API Error:", error);
    throw new Error(`Failed to analyze code: ${error.message}`);
  }
}