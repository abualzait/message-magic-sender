import io from 'socket.io-client';

class WebSocketService {
  private socket: SocketIOClient.Socket | null = null;
  private messageHandlers: ((data: any) => void)[] = [];

  connect() {
    this.socket = io('http://localhost:5000', { transports: ['websocket'] });

    this.socket.on('connect', () => {
      console.log("WebSocket connected successfully");
    });

    this.socket.on('status_update', (data: any) => {
      console.log("WebSocket message received:", data);
      this.messageHandlers.forEach(handler => handler(data));
    });

    this.socket.on('error', (error: any) => {
      console.error("WebSocket error:", error);
    });

    this.socket.on('disconnect', () => {
      console.log("WebSocket connection closed");
      // Attempt to reconnect after 5 seconds
      setTimeout(() => this.connect(), 5000);
    });
  }

  addMessageHandler(handler: (data: any) => void) {
    this.messageHandlers.push(handler);
  }

  removeMessageHandler(handler: (data: any) => void) {
    this.messageHandlers = this.messageHandlers.filter(h => h !== handler);
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}

export const wsService = new WebSocketService();