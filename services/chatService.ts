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
      const url = `${API_BASE_URL}${endpoint}`;
      const headers = {
        ...this.getHeaders(),
        ...options.headers,
      };

      console.log("Making API request:", {
        url,
        method: options.method || 'GET',
        headers,
        body: options.body ? JSON.parse(options.body.toString()) : null,
      });

      const response = await fetch(url, {
        headers,
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

      // Handle 204 No Content - no body to parse
      if (response.status === 204) {
        return null as unknown as T;
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

  async getChatSessions(): Promise<{ id: string; title: string; updated_at: string }[]> {
    return this.request<{ id: string; title: string; updated_at: string }[]>('/chat/sessions', {
      method: 'GET',
    });
  }

  async createChatSession(): Promise<{ thread_id: string; title: string }> {
    return this.request<{ thread_id: string; title: string }>('/chat/sessions', {
      method: 'POST',
    });
  }

  async deleteChatSession(id: string): Promise<void> {
    await this.request<void>(`/chat/sessions/${id}`, {
      method: 'DELETE',
    });
  }

  async getChatHistory(threadId: string, limit: number, beforeId?: string): Promise<GetHistoryResponse> {
    const queryParams = new URLSearchParams({ limit: limit.toString() });
    if (beforeId) queryParams.append('before_id', beforeId);

    return this.request<GetHistoryResponse>(`/chat/history/${threadId}?${queryParams.toString()}`, {
      method: 'GET',
    });
  }
}

export const chatService = new ChatService();