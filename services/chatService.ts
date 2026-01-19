import { API_BASE_URL } from '../constants';
import { SendMessageResponse, GetHistoryResponse, EditMessageResponse } from '../types';

class ChatService {
  private getHeaders(): HeadersInit {
    const token = localStorage.getItem('access_token');
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
    };
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          ...this.getHeaders(),
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Handle unauthorized - maybe dispatch an event or throw a specific error
          localStorage.removeItem('access_token');
          window.location.href = '/'; // Simple redirect to login logic
        }
        throw new Error(`API Error: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API Request Failed:', error);
      throw error;
    }
  }

  async sendMessage(message: string, threadId: string): Promise<SendMessageResponse> {
    return this.request<SendMessageResponse>('/chat/send', {
      method: 'POST',
      body: JSON.stringify({ message, thread_id: threadId }),
    });
  }

  async getHistory(threadId: string): Promise<GetHistoryResponse> {
    return this.request<GetHistoryResponse>(`/chat/history/${threadId}`, {
      method: 'GET',
    });
  }

  async editMessage(threadId: string, messageId: string, newContent: string): Promise<EditMessageResponse> {
    return this.request<EditMessageResponse>('/chat/edit', {
      method: 'PUT',
      body: JSON.stringify({
        thread_id: threadId,
        message_id: messageId,
        new_content: newContent,
      }),
    });
  }

  async checkHealth(): Promise<{ status: string }> {
    return this.request<{ status: string }>('/chat/health');
  }
}

export const chatService = new ChatService();