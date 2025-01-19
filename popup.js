document.getElementById("checkButton").addEventListener("click", async () => {
  const url = document.getElementById("urlInput").value;
  const resultElement = document.getElementById("result");
  const progressBar = document.getElementById("progressBar");
  const statusText = document.getElementById("statusText");

  if (!url) {
    resultElement.textContent = "Please enter a URL";
    return;
  }

  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    resultElement.textContent = "Invalid URL format";
    return;
  }

  resultElement.textContent = "";
  progressBar.style.width = "0%";
  progressBar.style.display = "block";
  statusText.textContent = "Analyzing URL...";

  try {
    const response = await fetch("http://localhost:5000/check-url", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      },
      body: JSON.stringify({ url })
    });

    if (!response.ok) throw new Error("Server error");
    
    const data = await response.json();
    progressBar.style.width = "100%";

    if (data.is_phishing) {
      resultElement.innerHTML = `
        <div class="alert alert-danger">
          <strong>Warning: Potential Phishing URL</strong>
          <p>Confidence: ${(data.confidence * 100).toFixed(1)}%</p>
          <ul>
            ${Object.entries(data.features).map(([key, value]) => 
              `<li>${key}: ${value}</li>`
            ).join('')}
          </ul>
        </div>`;
    } else {
      resultElement.innerHTML = `
        <div class="alert alert-success">
          <strong>Safe URL</strong>
          <p>Confidence: ${((1 - data.confidence) * 100).toFixed(1)}%</p>
        </div>`;
    }
  } catch (error) {
    progressBar.style.display = "none";
    resultElement.innerHTML = `
      <div class="alert alert-danger">
        Error: ${error.message || "Connection failed"}
      </div>`;
  }
});

document.getElementById("scanEmailsButton")?.addEventListener("click", async () => {
  const emailResult = document.getElementById("emailResult");
  const progressBar = document.getElementById("emailProgressBar");

  progressBar.style.width = "0%";
  progressBar.style.display = "block";
  emailResult.textContent = "Scanning emails...";

  try {
    const response = await fetch("http://localhost:5000/scan-bulk", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    });

    if (!response.ok) throw new Error("Server error");
    
    const data = await response.json();
    progressBar.style.width = "100%";

    if (data.results?.length > 0) {
      emailResult.innerHTML = `
        <div class="scan-results">
          <h4>Scan Results:</h4>
          <ul>
            ${data.results.map(result => `
              <li class="${result.is_phishing ? 'phishing' : 'safe'}">
                ${result.url}
              </li>
            `).join('')}
          </ul>
        </div>`;
    } else {
      emailResult.textContent = "No suspicious emails found";
    }
  } catch (error) {
    progressBar.style.display = "none";
    emailResult.innerHTML = `
      <div class="alert alert-danger">
        Error: ${error.message || "Connection failed"}
      </div>`;
  }
});

document.getElementById("urlInput")?.addEventListener("input", (e) => {
  const url = e.target.value;
  document.getElementById("checkButton").disabled = !url;
});