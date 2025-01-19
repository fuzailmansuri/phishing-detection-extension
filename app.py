from flask import Flask, request, jsonify
import pickle
import pandas as pd

app = Flask(__name__)

# Load the trained model
with open("model.pkl", "rb") as f:
    model = pickle.load(f)

# Route for checking URLs
@app.route("/check-url", methods=["POST"])
def check_url():
    data = request.json
    url = data["url"]
    features = {
        "length": len(url),
        "num_subdomains": url.count("."),
        "has_https": 1 if "https://" in url else 0,
        "has_ip": 1 if any(char.isdigit() for char in url) else 0,
    }
    prediction = model.predict(pd.DataFrame([features]))[0]
    return jsonify({"isPhishing": bool(prediction)})

# Route for scanning emails
@app.route("/scan-emails", methods=["POST"])
def scan_emails_endpoint():
    try:
        # Replace this with your email scanning logic
        phishing_emails = ["phishing1@example.com", "phishing2@example.com"]
        return jsonify({"phishingEmails": phishing_emails})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True)