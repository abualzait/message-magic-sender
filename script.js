// Initialize Socket.IO connection
const socket = io('http://localhost:5000', {
    transports: ['websocket'],
    autoConnect: true
});

// DOM Elements
const connectionStatus = document.getElementById('connection-status');
const uploadForm = document.getElementById('upload-form');
const uploadStatus = document.getElementById('upload-status');
const messagesContainer = document.getElementById('messages');
const processingStatus = document.getElementById('processing-status');

// Socket.IO event handlers
socket.on('connect', () => {
    console.log('Connected to WebSocket server');
    connectionStatus.textContent = 'Connected';
    connectionStatus.style.color = '#28a745';
    
    // Store the client ID
    const clientId = socket.id;
    console.log('Client ID:', clientId);
});

socket.on('connect_error', (error) => {
    console.error('Connection error:', error);
    connectionStatus.textContent = 'Connection Error';
    connectionStatus.style.color = '#dc3545';
});

socket.on('disconnect', () => {
    console.log('Disconnected from server');
    connectionStatus.textContent = 'Disconnected';
    connectionStatus.style.color = '#dc3545';
});

socket.on('new_message', (data) => {
    console.log('New message received:', data);
    displayMessage(data, 'received');
});

socket.on('message_status', (response) => {
    console.log('Message status:', response);
    if (response.status === 'failed') {
        showError(response.error);
    }
});

// File upload handler
uploadForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const fileInput = document.getElementById('file-input');
    const file = fileInput.files[0];
    
    if (!file) {
        showError('Please select a file first');
        return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
        uploadStatus.textContent = 'Uploading...';
        uploadStatus.className = '';
        
        const response = await fetch('http://localhost:5000/upload', {
            method: 'POST',
            body: formData
        });

        const data = await response.json();

        if (response.ok) {
            showSuccess('File uploaded successfully');
            if (data.messages) {
                processingStatus.innerHTML = '<h3>Processed Messages:</h3>' +
                    data.messages.map(msg => `<div>${msg}</div>`).join('');
            }
        } else {
            showError(data.error || 'Upload failed');
        }
    } catch (error) {
        console.error('Upload error:', error);
        showError('Error uploading file');
    }
});

// Custom message sending
function sendCustomMessage() {
    const recipientId = document.getElementById('recipient-id').value;
    const messageInput = document.getElementById('message-input');
    const message = messageInput.value;

    if (!recipientId || !message) {
        showError('Please enter both recipient ID and message');
        return;
    }

    socket.emit('message', {
        content: message,
        to: recipientId,
        from: socket.id,
        timestamp: new Date().toISOString()
    });

    displayMessage({
        content: message,
        from: socket.id,
        timestamp: new Date().toISOString()
    }, 'sent');

    messageInput.value = '';
}

// Utility functions
function displayMessage(messageData, type = 'received') {
    const messageElement = document.createElement('div');
    messageElement.className = `message ${type}`;
    messageElement.innerHTML = `
        <strong>${messageData.from}</strong>
        <p>${messageData.content}</p>
        <small>${new Date(messageData.timestamp).toLocaleString()}</small>
    `;
    messagesContainer.appendChild(messageElement);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function showSuccess(message) {
    uploadStatus.textContent = message;
    uploadStatus.className = 'success';
}

function showError(message) {
    uploadStatus.textContent = message;
    uploadStatus.className = 'error';
}