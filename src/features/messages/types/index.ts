// Move from src/types/messages.ts
export interface MessageStatus {
  phoneNumber: string;
  status: 'pending' | 'sent' | 'failed' | 'retry';
  timestamp: string;
  retries: number;
  message: string;
  errorReason?: string;
}