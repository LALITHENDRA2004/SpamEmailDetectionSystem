from flask import Flask, render_template, request, jsonify
import tensorflow as tf
from tensorflow.keras.preprocessing.sequence import pad_sequences
import pickle
import numpy as np

app = Flask(__name__)

# Load model and tokenizer
print("Loading model and tokenizer...")
model = tf.keras.models.load_model('spam_model.keras')
with open('tokenizer.pkl', 'rb') as handle:
    tokenizer = pickle.load(handle)
print("Model and tokenizer loaded successfully.")

MAX_LEN = 100

@app.route('/')
def home():
    return render_template('index.html')

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
    app.run(debug=True)
