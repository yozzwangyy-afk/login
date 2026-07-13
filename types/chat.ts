export type Role = "user" | "assistant" | "system";

export interface ChatMessage {
  id: string;
  role: Role;
  content: string;
  createdAt: number;
  /** true while the message is still being streamed/typed out */
  isStreaming?: boolean;
  /** true if generation was stopped early by the user */
  stopped?: boolean;
  /** true if this message failed to generate */
  error?: boolean;
}

export interface Conversation {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: ChatMessage[];
}

export interface ChatApiRequest {
  prompt: string;
  system?: string;
  temperature?: number;
}

export interface ChatApiResponse {
  status: boolean;
  data?: string;
  result?: string;
  message?: string;
  error?: string;
}
