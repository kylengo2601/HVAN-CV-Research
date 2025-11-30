# app.py
from flask import Flask, request, jsonify
from flask_cors import CORS
import cv2
import numpy as np
import tensorflow as tf
from tensorflow import keras
import pickle
import base64
import os
from datetime import datetime
from recognizer import *

app = Flask(__name__)
CORS(app)


@app.route('/api/recognize-face', methods=['POST'])
def recognize_face():
    try:
        data = request.get_json() # Decide whether to have path or the image itself in the json
        
        if not data or 'image' not in data:  # {"image": "<base64-encoded-string>"}
            return jsonify({'error': 'No image provided'}), 400
        
        results = []
        # Preprocess input
        processed_face = preprocess_input("input_placeholder") # input path here
        
        # Load the model
        model = load_model()

        # Predict
        predicted_name, confidence = make_prediction(model, processed_face)
        
        results.append({
            'name': predicted_name,
            'confidence': float(confidence),
        })

        return jsonify({
            'success': True,
            'faces': results,
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy'})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)