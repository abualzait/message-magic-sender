from flask import Flask, request, jsonify
from flask_socketio import SocketIO, emit
from flask_cors import CORS
import eventlet
import os
import subprocess
from werkzeug.utils import secure_filename
import json

app = Flask(__name__)
CORS(app)
app.config['SECRET_KEY'] = 'your-secret-key-here'
app.config['UPLOAD_FOLDER'] = 'uploads'
socketio = SocketIO(app, cors_allowed_origins="*")

# Ensure upload directory exists
if not os.path.exists(app.config['UPLOAD_FOLDER']):
    os.makedirs(app.config['UPLOAD_FOLDER'])

active_connections = {}  # Store active WebSocket connections


@socketio.on('connect')
def handle_connect():
    print('Client connected')
    client_id = request.sid
    active_connections[client_id] = True
    emit('connect_response', {'status': 'connected', 'client_id': client_id})


@socketio.on('disconnect')
def handle_disconnect():
    print('Client disconnected')
    client_id = request.sid
    if client_id in active_connections:
        del active_connections[client_id]


@socketio.on('message')
def handle_message(data):
    print('Received message:', data)
    recipient_id = data.get('to')
    if recipient_id in active_connections:
        emit('new_message', data, room=recipient_id)
    else:
        emit('message_status', {
            'status': 'failed',
            'error': 'Recipient not found or offline'
        }, room=request.sid)


@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    if file:
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        print(f"File saved to {filepath}")

        # Trigger send.py to process the uploaded file
        try:
            subprocess.Popen(["python", "send.py", filepath])
            return jsonify({
                'status': 'success',
                'message': f'File {filename} uploaded and sent for processing',
            })
        except Exception as e:
            print(f"Error triggering send.py: {e}")
            return jsonify({'error': str(e)}), 500


@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy'}), 200


@socketio.on('ws_message')
def handle_ws_message(data):
    print(f"Received WebSocket message: {data}")
    emit('response', {'status': 'received'})


if __name__ == '__main__':
    eventlet.monkey_patch()
    socketio.run(app, host='0.0.0.0', port=5000, debug=True)
