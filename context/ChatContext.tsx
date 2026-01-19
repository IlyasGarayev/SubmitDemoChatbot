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
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [threads, setThreads] = useState<Thread[]>([]);
  const [currentThreadId, setCurrentThreadId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [language, setLanguageState] = useState<Language>('az');
  const [error, setError] = useState<string | null>(null);

  // Initialize
  useEffect(() => {
    // Load threads from local storage
    const savedThreads = localStorage.getItem('threads');
    if (savedThreads) {
      setThreads(JSON.parse(savedThreads));
    }

    const savedLang = localStorage.getItem('language');
    if (savedLang) {
      setLanguageState(savedLang as Language);
    }

    // If no threads, create one
    if (!savedThreads || JSON.parse(savedThreads).length === 0) {
      const newId = uuidv4();
      const initialThread: Thread = { id: newId, title: 'Yeni Söhbət', lastModified: Date.now() };
      setThreads([initialThread]);
      setCurrentThreadId(newId);
      // Initialize with greeting
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
  }, []);

  // Save threads when changed
  useEffect(() => {
    localStorage.setItem('threads', JSON.stringify(threads));
  }, [threads]);

  // Save language
  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
  };

  // Load history when thread changes
  useEffect(() => {
    if (!currentThreadId) return;

    const loadHistory = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Attempt to fetch from API
        const data = await chatService.getHistory(currentThreadId);
        
        const mappedMessages: Message[] = data.messages.map(m => ({
          ...m,
          timestamp: Date.now() // API doesn't return timestamp, mock it for sorting if needed
        }));

        if (mappedMessages.length === 0) {
           setMessages([{
            id: uuidv4(),
            type: MessageType.AI,
            content: INITIAL_GREETING[language],
            timestamp: Date.now()
          }]);
        } else {
          setMessages(mappedMessages);
        }

      } catch (err) {
        console.warn("Could not fetch history (backend might be offline), checking local storage backup or initializing new");
        // Fallback for demo/offline purposes
        setMessages([{
            id: uuidv4(),
            type: MessageType.AI,
            content: INITIAL_GREETING[language],
            timestamp: Date.now()
        }]);
      } finally {
        setIsLoading(false);
      }
    };

    loadHistory();
  }, [currentThreadId, language]);

  const sendMessage = async (content: string) => {
    if (!content.trim()) return;

    const userMsgId = uuidv4();
    const newUserMsg: Message = {
      id: userMsgId,
      type: MessageType.Human,
      content: content,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, newUserMsg]);
    setIsLoading(true);
    setError(null);

    try {
      const data = await chatService.sendMessage(content, currentThreadId);
      
      const newAiMsg: Message = {
        id: uuidv4(), // API doesn't return ID for response immediately usually, but we need one for React key
        type: MessageType.AI,
        content: data.response,
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, newAiMsg]);
      
      // Update thread title if it's the first user message
      updateThreadTitleIfNeeded(content);

    } catch (err) {
      setError("Failed to send message. Please check your connection.");
      // Remove the optimistic message if failed? Or keep it with error state.
      // Keeping it simple for now.
    } finally {
      setIsLoading(false);
    }
  };

  const editMessage = async (messageId: string, newContent: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Find the index of the message being edited
      const msgIndex = messages.findIndex(m => m.id === messageId);
      if (msgIndex === -1) throw new Error("Message not found");

      // Optimistic update:
      // 1. Slice history up to the edited message
      // 2. Update the edited message content
      const historyUntilEdit = messages.slice(0, msgIndex);
      const updatedUserMsg = { ...messages[msgIndex], content: newContent };
      
      // Temporary state while fetching
      setMessages([...historyUntilEdit, updatedUserMsg]);

      const data = await chatService.editMessage(currentThreadId, messageId, newContent);

      const newAiMsg: Message = {
        id: uuidv4(),
        type: MessageType.AI,
        content: data.response,
        timestamp: Date.now()
      };

      setMessages([...historyUntilEdit, updatedUserMsg, newAiMsg]);

    } catch (err) {
      setError("Failed to edit message.");
      // Revert logic could go here
    } finally {
      setIsLoading(false);
    }
  };

  const createNewThread = () => {
    const newId = uuidv4();
    const newThread: Thread = {
      id: newId,
      title: 'Yeni Söhbət',
      lastModified: Date.now()
    };
    setThreads(prev => [newThread, ...prev]);
    setCurrentThreadId(newId);
  };

  const selectThread = (threadId: string) => {
    setCurrentThreadId(threadId);
  };

  const deleteThread = (threadId: string) => {
    const newThreads = threads.filter(t => t.id !== threadId);
    setThreads(newThreads);
    if (currentThreadId === threadId && newThreads.length > 0) {
      setCurrentThreadId(newThreads[0].id);
    } else if (newThreads.length === 0) {
      createNewThread();
    }
  };

  const updateThreadTitleIfNeeded = (content: string) => {
    setThreads(prev => prev.map(t => {
      if (t.id === currentThreadId && t.title === 'Yeni Söhbət') {
        return { ...t, title: content.slice(0, 30) + (content.length > 30 ? '...' : '') };
      }
      return t;
    }));
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
      error
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