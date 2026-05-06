from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
import tensorflow as tf
from tensorflow.keras.preprocessing.sequence import pad_sequences
import pickle
import numpy as np
import os

app = Flask(__name__)
CORS(app) # Enable CORS for all routes

# Load model and tokenizer
print("Loading model and tokenizer...")
model = tf.keras.models.load_model('model/spam_model.keras')
with open('model/tokenizer.pkl', 'rb') as handle:
    tokenizer = pickle.load(handle)
print("Model and tokenizer loaded successfully.")

MAX_LEN = 100

@app.route('/')
def home():
    return "Spam Detection API is running. Send POST requests to /predict"

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.get_json()
        text = data.get('text', '')
        if not text.strip():
            return jsonify({'error': 'No text provided'}), 400

        # Preprocess
        sequences = tokenizer.texts_to_sequences([text])
        padded = pad_sequences(sequences, maxlen=MAX_LEN, padding='post', truncating='post')

        # Predict
        prediction = model.predict(padded)
        spam_probability = float(prediction[0][0])
        
        is_spam = spam_probability > 0.5
        
        return jsonify({
            'is_spam': is_spam,
            'confidence': spam_probability
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)
