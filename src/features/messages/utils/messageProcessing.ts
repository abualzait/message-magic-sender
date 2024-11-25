import { MessageStatus } from "../types";

export const updateMessageStatus = (
  currentStatus: MessageStatus,
  newStatus: 'pending' | 'sent' | 'failed' | 'retry',
  errorReason?: string
): MessageStatus => {
  return {
    ...currentStatus,
    status: newStatus,
    errorReason,
    timestamp: new Date().toISOString(),
    retries: newStatus === 'retry' ? currentStatus.retries + 1 : currentStatus.retries
  };
};

export const processApiResponse = async (response: Response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to process request');
  }
  return response.json();
};
