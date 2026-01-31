import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Message, Thread, MessageType, Language } from '../types';
import { chatService } from '../services/chatService';
import { INITIAL_GREETING } from '../constants';

interface ChatContextType {
  messages: Message[];
  threads: Thread[];
  currentThreadId: string;
  isLoading: boolean;
  language: Language;
  setLanguage: (lang: Language) => void;
  sendMessage: (content: string) => Promise<void>;
  editMessage: (messageId: string, newContent: string) => Promise<void>;
  createNewThread: () => void;
  selectThread: (threadId: string) => void;
  deleteThread: (threadId: string) => void;
  error: string | null;
  backendAvailable: boolean;
  fetchOlderMessages: (beforeId: string) => Promise<void>;
  updateThreads: (newThreads: Thread[]) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [threads, setThreads] = useState<Thread[]>([]);
  const [currentThreadId, setCurrentThreadId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [language, setLanguageState] = useState<Language>('az');
  const [error, setError] = useState<string | null>(null);
  const [backendAvailable, setBackendAvailable] = useState<boolean>(false);
  const [backendCheckCompleted, setBackendCheckCompleted] = useState<boolean>(false);

  // Check backend health first
  useEffect(() => {
    const checkBackendHealth = async () => {
      try {
        const health = await chatService.checkHealth();
        console.log('Backend is available:', health.status);
        setBackendAvailable(true);
      } catch (error) {
        console.error('Backend is not reachable:', error);
        setBackendAvailable(false);
      } finally {
        setBackendCheckCompleted(true);
      }
    };

    checkBackendHealth();
  }, []);

  // Initialize
  useEffect(() => {
    if (!backendCheckCompleted) return;

    console.log("Initializing ChatContext...");
    console.log("Saved threads:", localStorage.getItem('threads'));
    console.log("Saved language:", localStorage.getItem('language'));
    console.log("Current thread ID:", currentThreadId);

    const savedThreads = localStorage.getItem('threads');
    if (savedThreads) {
      setThreads(JSON.parse(savedThreads));
    }

    const savedLang = localStorage.getItem('language');
    if (savedLang) {
      setLanguageState(savedLang as Language);
    }

    if (!savedThreads || JSON.parse(savedThreads).length === 0) {
      console.log("No threads found. Creating a new thread...");
      const newId = uuidv4();
      const initialThread: Thread = { id: newId, title: 'Yeni Söhbət', lastModified: Date.now() };
      setThreads([initialThread]);
      setCurrentThreadId(newId);
      setMessages([{
        id: uuidv4(),
        type: MessageType.AI,
        content: INITIAL_GREETING.az,
        timestamp: Date.now()
      }]);
    } else {
      const parsedThreads = JSON.parse(savedThreads);
      setCurrentThreadId(parsedThreads[0].id);
    }
  }, [backendCheckCompleted]);

  // Save threads when changed
  useEffect(() => {
    localStorage.setItem('threads', JSON.stringify(threads));
  }, [threads]);

  // Save language
  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
  };

  // Load history when thread changes (only if backend is available)
  useEffect(() => {
    if (!currentThreadId || !backendAvailable) {
      if (!backendAvailable && currentThreadId) {
        setMessages([
          {
            id: uuidv4(),
            type: MessageType.AI,
            content: INITIAL_GREETING[language],
            timestamp: Date.now(),
          },
        ]);
      }
      return;
    }

    let isMounted = true;

    const loadHistory = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await chatService.getHistory(currentThreadId);

        if (isMounted) {
          const mappedMessages: Message[] = data.messages.map((m) => ({
            id: m.message_id || uuidv4(),
            type: m.type,
            content: m.content,
            timestamp: m.timestamp || Date.now(),
            messageId: m.message_id || null,
            responseId: m.response_id || null,
          }));

          if (mappedMessages.length === 0) {
            setMessages([
              {
                id: uuidv4(),
                type: MessageType.AI,
                content: INITIAL_GREETING[language],
                timestamp: Date.now(),
                messageId: null,
                responseId: null,
              },
            ]);
          } else {
            setMessages(mappedMessages);
          }
        }
      } catch (err) {
        console.warn("Could not fetch history from backend");
        if (isMounted) {
          setMessages([
            {
              id: uuidv4(),
              type: MessageType.AI,
              content: INITIAL_GREETING[language],
              timestamp: Date.now(),
            },
          ]);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadHistory();

    return () => {
      isMounted = false;
    };
  }, [currentThreadId, language, backendAvailable]);

  const sendMessage = async (content: string) => {
    if (!content.trim()) return;

    if (!backendAvailable) {
      setError('Backend is currently unavailable. Please try again later.');
      return;
    }

    console.log("Sending message:", content);
    console.log("Current thread ID:", currentThreadId);

    const userMsgId = uuidv4();
    const newUserMsg: Message = {
      id: userMsgId,
      type: MessageType.Human,
      content: content,
      timestamp: Date.now(),
      messageId: null,
      responseId: null
    };

    setMessages(prev => [...prev, newUserMsg]);
    setIsLoading(true);
    setError(null);

    try {
      const data = await chatService.sendMessage(content, currentThreadId);
      console.log("Response from backend:", data);

      if (!data.message_id || !data.response_id || !data.response) {
        throw new Error("Incomplete response from backend: " + JSON.stringify(data));
      }

      setMessages(prev => prev.map(msg => 
        msg.id === userMsgId ? { ...msg, messageId: data.message_id } : msg
      ));

      const newAiMsg: Message = {
        id: uuidv4(),
        type: MessageType.AI,
        content: data.response,
        timestamp: Date.now(),
        messageId: data.response_id,
        responseId: null
      };
      setMessages(prev => [...prev, newAiMsg]);

      updateThreadTitleIfNeeded(content);

    } catch (err) {
      console.error("Error sending message:", err);
      setError("Failed to send message. Please check your connection.");
    } finally {
      setIsLoading(false);
    }
  };

  const editMessage = async (messageId: string, newContent: string) => {
    if (!backendAvailable) {
      setError('Backend is currently unavailable. Please try again later.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log("Editing message:", { messageId, newContent, threadId: currentThreadId });

      const msgIndex = messages.findIndex(m => m.messageId === messageId);
      if (msgIndex === -1) throw new Error("Message not found");

      const historyUntilEdit = messages.slice(0, msgIndex);
      const updatedUserMsg = { ...messages[msgIndex], content: newContent };

      setMessages([...historyUntilEdit, updatedUserMsg]);

      const data = await chatService.editMessage(currentThreadId, messageId, newContent);

      console.log("Edit response from backend:", data);

      const newAiMsg: Message = {
        id: uuidv4(),
        type: MessageType.AI,
        content: data.response,
        timestamp: Date.now(),
        messageId: data.response_id,
        responseId: null
      };

      setMessages([...historyUntilEdit, updatedUserMsg, newAiMsg]);

    } catch (err) {
      console.error("Error editing message:", err);
      setError("Failed to edit message.");
    } finally {
      setIsLoading(false);
    }
  };

  const createNewThread = useCallback(() => {
    const newId = uuidv4();
    const newThread: Thread = {
      id: newId,
      title: 'Yeni Söhbət',
      lastModified: Date.now()
    };
    setThreads(prev => [newThread, ...prev]);
    setCurrentThreadId(newId);
  }, []);

  const selectThread = useCallback((threadId: string) => {
    setCurrentThreadId(threadId);
  }, []);

  const deleteThread = useCallback((threadId: string) => {
    setThreads((threads) => {
      const newThreads = threads.filter(t => t.id !== threadId);
      if (currentThreadId === threadId && newThreads.length > 0) {
        setCurrentThreadId(newThreads[0].id);
      } else if (newThreads.length === 0 && threadId === currentThreadId) {
        // Create a new thread if we deleted the current one and have no others
        const newId = uuidv4();
        const initialThread: Thread = { id: newId, title: 'Yeni Söhbət', lastModified: Date.now() };
        setCurrentThreadId(newId);
        return [initialThread];
      }
      return newThreads;
    });
  }, [currentThreadId]);

  const updateThreadTitleIfNeeded = useCallback((content: string) => {
    setThreads(prev => prev.map(t => {
      if (t.id === currentThreadId && t.title === 'Yeni Söhbət') {
        return { ...t, title: content.slice(0, 30) + (content.length > 30 ? '...' : '') };
      }
      return t;
    }));
  }, [currentThreadId]);

  const fetchOlderMessages = useCallback(async (beforeId: string) => {
    if (!currentThreadId || !backendAvailable) return;

    setIsLoading(true);
    setError(null);

    try {
      const data = await chatService.getChatHistory(currentThreadId, 20, beforeId);

      const olderMessages: Message[] = data.messages.map((m) => ({
        id: m.message_id || uuidv4(),
        type: m.type,
        content: m.content,
        timestamp: m.timestamp || Date.now(),
        messageId: m.message_id || null,
        responseId: m.response_id || null,
      }));

      setMessages((prev) => {
        // Create a Set of existing message IDs for efficient lookup
        const existingIds = new Set(prev.map(m => m.id));
        
        // Filter out any older messages that are already in the state
        const newMessages = olderMessages.filter(m => !existingIds.has(m.id));
        
        // Merge and sort by timestamp to ensure correct order
        return [...newMessages, ...prev].sort((a, b) => 
          (a.timestamp || 0) - (b.timestamp || 0)
        );
      });
    } catch (err) {
      console.error('Error fetching older messages:', err);
      setError('Failed to load older messages.');
    } finally {
      setIsLoading(false);
    }
  }, [currentThreadId, backendAvailable]);

  const updateThreads = useCallback((newThreads: Thread[]) => {
    setThreads(newThreads);
    if (newThreads.length > 0 && !currentThreadId) {
      setCurrentThreadId(newThreads[0].id);
    }
  }, [currentThreadId]);

  const replaceMessagesAfterEdit = (messageId: string, newMessages: Message[]) => {
    const msgIndex = messages.findIndex((m) => m.messageId === messageId);
    if (msgIndex === -1) return;

    const historyUntilEdit = messages.slice(0, msgIndex + 1);
    setMessages([...historyUntilEdit, ...newMessages]);
  };



  return (
    <ChatContext.Provider value={{
      messages,
      threads,
      currentThreadId,
      isLoading,
      language,
      setLanguage,
      sendMessage,
      editMessage,
      createNewThread,
      selectThread,
      deleteThread,
      error,
      backendAvailable,
      fetchOlderMessages,
      updateThreads
    }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) throw new Error('useChat must be used within a ChatProvider');
  return context;
};