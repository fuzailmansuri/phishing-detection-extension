document.getElementById("checkButton").addEventListener("click", async () => {
  const url = document.getElementById("urlInput").value;
  const resultElement = document.getElementById("result");

  if (!url) {
    resultElement.textContent = "Please enter a URL.";
    return;
  }

  // Validate URL format
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    resultElement.textContent = "Please enter a valid URL (starting with http:// or https://).";
    return;
  }

  // Show loading message
  resultElement.textContent = "Loading...";
  resultElement.style.color = "blue";

  try {
    const isPhishing = await checkUrl(url);

    if (isPhishing) {
      resultElement.textContent = "Warning: This is a phishing URL!";
      resultElement.style.color = "red";
    } else {
      resultElement.textContent = "This URL is safe.";
      resultElement.style.color = "green";
    }
  } catch (error) {
    console.error("Error:", error);
    if (error.message.includes("Failed to fetch")) {
      resultElement.textContent = "Unable to connect to the server. Please check your internet connection.";
    } else {
      resultElement.textContent = "An error occurred. Please try again.";
    }
    resultElement.style.color = "red";
  }
});

async function checkUrl(url) {
  const response = await fetch("http://localhost:5000/check-url", {
    method: "POST",
    body: JSON.stringify({ url: url }),
    headers: { "Content-Type": "application/json" }
  });

  if (!response.ok) {
    throw new Error(`HTTP error! Status: ${response.status}`);
  }

  const result = await response.json();
  return result.isPhishing;
}

// Add event listener for email scanning
const scanEmailsButton = document.getElementById("scanEmailsButton");
const emailResultElement = document.getElementById("emailResult");

if (scanEmailsButton && emailResultElement) {
  scanEmailsButton.addEventListener("click", async () => {
    // Show loading message
    emailResultElement.textContent = "Scanning emails...";
    emailResultElement.style.color = "blue";

    try {
      const response = await fetch("http://localhost:5000/scan-emails", {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });
      const result = await response.json();

      if (result.phishingEmails && result.phishingEmails.length > 0) {
        emailResultElement.textContent = `Phishing emails detected: ${result.phishingEmails.join(", ")}`;
        emailResultElement.style.color = "red";
      } else {
        emailResultElement.textContent = "No phishing emails detected.";
        emailResultElement.style.color = "green";
      }
    } catch (error) {
      console.error("Error:", error);
      if (error.message.includes("Failed to fetch")) {
        emailResultElement.textContent = "Unable to connect to the server. Please check your internet connection.";
      } else {
        emailResultElement.textContent = "An error occurred. Please try again.";
      }
      emailResultElement.style.color = "red";
    }
  });
} else {
  console.error("Scan Emails Button or Email Result Element not found!");
}