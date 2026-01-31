export type Language = 'az' | 'en' | 'ru';

export enum MessageType {
  Human = 'HumanMessage',
  AI = 'AIMessage',
  System = 'SystemMessage'
}

export interface User {
  name: string;
  email: string;
  picture?: string;
  exp?: number;
}

export interface Message {
  id: string;
  type: MessageType;
  content: string;
  timestamp: number;
  messageId?: string; // Added to store backend message_id
  responseId?: string; // Added to store backend response_id
}

export interface Thread {
  id: string;
  title: string;
  lastModified: number;
}

// API Response Types
export interface SendMessageResponse {
  response: string;
  thread_id: string;
  message_id: string; // Added to match backend response
  response_id: string; // Added to match backend response
}

export interface GetHistoryResponse {
  thread_id: string;
  messages: {
    id: string;
    type: MessageType;
    content: string;
    timestamp: number; // Added to match backend response
    message_id: string; // Added to match backend response
    response_id: string; // Added to match backend response
  }[];
}

export interface EditMessageRequest {
  thread_id: string;
  message_id: string;
  new_content: string;
}

export interface EditMessageResponse {
  response: string;
  thread_id: string;
  response_id: string; // Added to match backend response
}