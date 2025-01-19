import pandas as pd
from sklearn.ensemble import RandomForestClassifier
import pickle

# Example dataset (replace with real data)
data = {
    "length": [20, 30, 40, 50],
    "num_subdomains": [1, 2, 3, 4],
    "has_https": [1, 0, 1, 0],
    "has_ip": [0, 1, 0, 1],
    "is_phishing": [0, 1, 0, 1],
}

df = pd.DataFrame(data)

# Features and target
X = df.drop("is_phishing", axis=1)
y = df["is_phishing"]

# Train the model
model = RandomForestClassifier()
model.fit(X, y)

# Save the model
with open("model.pkl", "wb") as f:
    pickle.dump(model, f)

print("Model trained and saved as model.pkl!")