import pandas as pd
from time import sleep
import json
import websockets
import asyncio
import threading
from datetime import datetime

async def send_status_update(phone_number, status, error=None):
    """Send status updates through WebSocket."""
    uri = "ws://localhost:5000/ws"
    try:
        async with websockets.connect(uri) as websocket:
            message = {
                "type": "status_update",
                "phoneNumber": phone_number,
                "status": status,
                "error": error,
                "timestamp": datetime.now().isoformat()
            }
            await websocket.send(json.dumps(message))
    except Exception as e:
        print(f"WebSocket error: {e}")

def process_messages(file_path):
    """Process messages from Excel file."""
    try:
        # Read Excel file
        if file_path.endswith('.xlsx'):
            df = pd.read_excel(file_path)
        else:  # CSV
            df = pd.read_csv(file_path)
        
        # Ensure required columns exist
        required_columns = ['mobile_number', 'msg_body']
        if not all(col in df.columns for col in required_columns):
            print("Error: Required columns not found in file")
            return
        
        # Process each message
        for index, row in df.iterrows():
            phone_number = str(row['mobile_number'])
            message = str(row['msg_body'])
            
            # Simulate message sending (replace with actual WhatsApp API integration)
            sleep(2)  # Simulate processing time
            
            # Send status update via WebSocket
            asyncio.run(send_status_update(
                phone_number=phone_number,
                status="sent"
            ))
            
            print(f"Processed message to {phone_number}")
        
        print("All messages processed successfully")
        
    except Exception as e:
        print(f"Error processing file: {e}")

if __name__ == "__main__":
    # For testing
    process_messages("path/to/your/excel/file.xlsx")