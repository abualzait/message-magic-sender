import pandas as pd
from time import sleep
import socketio
import sys

# Initialize Socket.IO client
sio = socketio.Client()

def send_status_update(phone_number, status, error=None):
    """Send status updates through Socket.IO."""
    try:
        sio.emit('message', {
            'phoneNumber': phone_number,
            'status': status,
            'error': error,
        })
        print(f"Status update sent for {phone_number}: {status}")
    except Exception as e:
        print(f"Error sending status update: {e}")


def process_messages(file_path):
    """Process messages from a file."""
    try:
        # Read file
        if file_path.endswith('.xlsx'):
            df = pd.read_excel(file_path)
        elif file_path.endswith('.csv'):
            df = pd.read_csv(file_path)
        else:
            print("Unsupported file format. Please use .csv or .xlsx")
            return

        # Ensure required columns exist
        required_columns = ['mobile_number', 'msg_body']
        if not all(col in df.columns for col in required_columns):
            print("Error: Required columns not found in file")
            return

        # Process each message
        for index, row in df.iterrows():
            phone_number = str(row['mobile_number'])
            message = str(row['msg_body'])

            # Simulate sending message
            print(f"Sending message to {phone_number}: {message}")
            sleep(2)  # Simulate delay

            # Send status update
            send_status_update(phone_number, "sent")

        print("All messages processed successfully")

    except Exception as e:
        print(f"Error processing file: {e}")


@sio.event
def connect():
    print("Connected to WebSocket server")


@sio.event
def disconnect():
    print("Disconnected from WebSocket server")


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Error: File path argument missing")
    else:
        # Connect to Socket.IO server
        sio.connect('http://127.0.0.1:5000/socket.io/')
        process_messages(sys.argv[1])
        sio.disconnect()
