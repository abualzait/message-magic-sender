export interface MessageStatus {
  phoneNumber: string;
  status: 'pending' | 'sent' | 'failed' | 'retry';
  timestamp: string;
  retries: number;
  message: string;
}