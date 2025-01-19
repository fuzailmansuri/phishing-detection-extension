from flask import Flask, request, jsonify
from flask_cors import CORS
from urllib.parse import urlparse
import pandas as pd
import pickle
import tldextract
import logging
import sys

logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler('app.log')
    ]
)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

MODEL_PATH = "model.pkl"

try:
    with open(MODEL_PATH, "rb") as f:
        model = pickle.load(f)
        logger.info("Model loaded successfully")
except Exception as e:
    logger.error(f"Error loading model: {str(e)}")
    model = None

def extract_features(url):
    features = {}
    try:
        features['length'] = len(url)
        features['num_subdomains'] = url.count('.')
        features['has_https'] = int('https://' in url.lower())
        features['has_ip'] = int(any(char.isdigit() for char in url))
        return features
    except Exception as e:
        logger.error(f"Feature extraction error: {str(e)}")
        return None

@app.route("/check-url", methods=["POST"])
def check_url():
    try:
        data = request.get_json()
        logger.info(f"Received request: {data}")
        
        if not data or 'url' not in data:
            logger.error("No URL provided")
            return jsonify({"error": "No URL provided"}), 400

        url = data['url']
        features = extract_features(url)
        logger.debug(f"Extracted features: {features}")
        
        if not features:
            logger.error("Feature extraction failed")
            return jsonify({"error": "Feature extraction failed"}), 400

        if not model:
            logger.error("Model not loaded")
            return jsonify({"error": "Model not loaded"}), 500

        # Ensure the feature names match those used during model training
        feature_names = ['length', 'num_subdomains', 'has_https', 'has_ip']
        features = {key: features[key] for key in feature_names}

        prediction = model.predict(pd.DataFrame([features]))[0]
        confidence = model.predict_proba(pd.DataFrame([features]))[0][int(prediction)]
        result = {
            "is_phishing": bool(prediction),
            "confidence": confidence,
            "features": features
        }
        logger.info(f"Prediction result: {result}")
        return jsonify(result)

    except Exception as e:
        logger.error(f"Error processing request: {str(e)}", exc_info=True)
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True, port=5000)