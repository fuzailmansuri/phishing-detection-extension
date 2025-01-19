chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === "complete" && tab.active) {
      const url = tab.url;
      checkUrl(url).then(isPhishing => {
        if (isPhishing) {
          chrome.scripting.executeScript({
            target: { tabId: tabId },
            func: showWarning,
            args: ["Warning: This is a phishing site!"]
          });
        }
      });
    }
  });
  
  async function checkUrl(url) {
    const response = await fetch("http://localhost:5000/check-url", {
      method: "POST",
      body: JSON.stringify({ url: url }),
      headers: { "Content-Type": "application/json" }
    });
    const result = await response.json();
    return result.isPhishing;
  }
  
  function showWarning(message) {
    alert(message);
  }