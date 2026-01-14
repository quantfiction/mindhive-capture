export interface Config {
  apiEndpoint: string;
  apiKey: string;
}

export interface CaptureRequest {
  content: string;
  source: 'desktop';
  attachmentIds?: string[];
  clientId?: string;
}

export interface CaptureResponse {
  id: string;
  uciMessageId: string;
  content: string;
  status: string;
  createdAt: string;
  attachmentCount: number;
}

export interface PendingCapture {
  id: string;
  content: string;
  source: 'desktop';
  createdAt: string;
  retryCount: number;
  hasAttachment?: boolean;
  attachmentPath?: string;
}
