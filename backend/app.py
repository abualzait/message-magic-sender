import eventlet
eventlet.monkey_patch()

from flask import Flask, request, jsonify
from flask_socketio import SocketIO, emit
from flask_cors import CORS
import os
import logging
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
import time
import json

# Configure logging
logging.basicConfig(level=logging.INFO)

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "http://localhost:8080"}})
socketio = SocketIO(app, cors_allowed_origins="http://localhost:8080")

# Path to the Chrome profile
chrome_profile_path = 'C:\\Users\\Abual\\AppData\\Local\\Google\\Chrome\\User Data'

def load_message_queue():
    try:
        with open('message_queue.json', 'r') as f:
            return json.load(f)
    except FileNotFoundError:
        return []

def save_message_queue(queue):
    with open('message_queue.json', 'w') as f:
        json.dump(queue, f)

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    if file:
        file_path = os.path.join('uploads', file.filename)
        file.save(file_path)
        logging.info(f'File saved to {file_path}')
        try:
            process_file(file_path)
            return jsonify({'filePath': file_path}), 200
        except Exception as e:
            logging.error(f"Error processing file: {e}")
            return jsonify({'error': str(e)}), 500

def process_file(file_path):
    # Implement file processing logic here
    # For demonstration, assume we have a list of phone numbers and messages
    phone_numbers = ['1234567890', '0987654321']
    messages = ['Hello, this is a test message.', 'Another test message.']
    send_messages(phone_numbers, messages)

def send_messages(phone_numbers, messages):
    options = Options()
    options.add_argument(f'--user-data-dir={chrome_profile_path}')
    options.add_argument('--profile-directory=Default')
    options.add_argument('--no-sandbox')
    options.add_argument('--disable-dev-shm-usage')
    options.add_argument('--headless')
    options.add_argument('--disable-gpu')

    try:
        driver = webdriver.Chrome(options=options)
        driver.get('https://web.whatsapp.com/')

        message_queue = load_message_queue()

        for i, phone_number in enumerate(phone_numbers):
            message = messages[i]
            try:
                # Navigate to the contact
                search_box = driver.find_element(By.XPATH, '//div[@contenteditable="true"][@data-tab="3"]')
                search_box.clear()
                search_box.send_keys(phone_number)
                time.sleep(2)
                contact = driver.find_element(By.XPATH, f'//span[@title="{phone_number}"]')
                contact.click()
                time.sleep(2)
                # Send message
                message_box = driver.find_element(By.XPATH, '//div[@contenteditable="true"][@data-tab="9"]')
                message_box.send_keys(message)
                send_button = driver.find_element(By.XPATH, '//button[@data-testid="send"]')
                send_button.click()
                logging.info(f"Message sent to {phone_number}: {message}")
                # Emit status update
                socketio.emit('status_update', {
                    'phoneNumber': phone_number,
                    'status': 'sent',
                    'message': message,
                    'timestamp': time.strftime("%Y-%m-%d %H:%M:%S")
                })
            except Exception as e:
                logging.error(f"Error sending message to {phone_number}: {e}")
                message_queue.append({
                    'phoneNumber': phone_number,
                    'message': message,
                    'timestamp': time.strftime("%Y-%m-%d %H:%M:%S"),
                    'status': 'pending'
                })
                socketio.emit('status_update', {
                    'phoneNumber': phone_number,
                    'status': 'error',
                    'message': str(e),
                    'timestamp': time.strftime("%Y-%m-%d %H:%M:%S")
                })

        save_message_queue(message_queue)
        driver.quit()
    except Exception as e:
        logging.error(f"Error initializing WebDriver: {e}")
        raise

@socketio.on('connect')
def handle_connect():
    logging.info('Client connected')

@socketio.on('disconnect')
def handle_disconnect():
    logging.info('Client disconnected')

if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', port=5000)