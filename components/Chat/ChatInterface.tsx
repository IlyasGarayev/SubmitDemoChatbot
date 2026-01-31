import React, { useRef, useEffect, useLayoutEffect, useState, useCallback } from 'react';
import { Send, AlertCircle, Loader2 } from 'lucide-react';
import { useChat } from '../../context/ChatContext';
import MessageBubble from './MessageBubble';

const ChatInterface: React.FC = () => {
  const { messages, isLoading, sendMessage, error, fetchOlderMessages } = useChat();
  const [input, setInput] = useState('');
  const [loadingOlderMessages, setLoadingOlderMessages] = useState(false);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const scrollHeightBeforeRef = useRef<number>(0);
  const previousMessageCountRef = useRef<number>(0);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Handle scroll position preservation when loading older messages
  useLayoutEffect(() => {
    if (loadingOlderMessages && messagesContainerRef.current) {
      const container = messagesContainerRef.current;
      const newScrollHeight = container.scrollHeight;
      const diff = newScrollHeight - scrollHeightBeforeRef.current;

      // Adjust scroll position to maintain the user's view
      container.scrollTop = container.scrollTop + diff;
    }
  }, [messages, loadingOlderMessages]);

  // Scroll event handler for loading older messages
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const handleScroll = async () => {
      // Check if user scrolled to top
      if (container.scrollTop === 0 && !loadingOlderMessages && messages.length > 0) {
        const firstMessageId = messages[0]?.id;
        if (firstMessageId) {
          // Capture scroll height before fetching
          scrollHeightBeforeRef.current = container.scrollHeight;
          setLoadingOlderMessages(true);
          setShouldAutoScroll(false);

          try {
            await fetchOlderMessages(firstMessageId);
          } catch (error) {
            console.error('Failed to fetch older messages:', error);
          } finally {
            setLoadingOlderMessages(false);
          }
        }
      }
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [messages, loadingOlderMessages, fetchOlderMessages]);

  // Auto-scroll to bottom only when new messages arrive (not when loading old ones)
  useEffect(() => {
    const messageCount = messages.length;
    const previousCount = previousMessageCountRef.current;

    // Only auto-scroll if:
    // 1. Messages increased (new message arrived)
    // 2. We're not currently loading older messages
    // 3. shouldAutoScroll is true (user hasn't scrolled up to load history)
    if (messageCount > previousCount && !loadingOlderMessages && shouldAutoScroll) {
      scrollToBottom();
    }

    previousMessageCountRef.current = messageCount;
  }, [messages, loadingOlderMessages, shouldAutoScroll]);

  // Reset auto-scroll when sending a new message
  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const msg = input;
    setInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
    setShouldAutoScroll(true); // Enable auto-scroll for new messages
    await sendMessage(msg);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Auto-resize textarea
  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${e.target.scrollHeight}px`;
  };

  return (
    <div className="flex flex-col h-full relative">
      {/* Messages Area */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto px-4 lg:px-20 py-8 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700"
      >
        <div className="max-w-4xl mx-auto">
          {messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} />
          ))}

          {isLoading && (
            <div className="flex gap-4 animate-fade-in">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-az-blue to-az-green flex items-center justify-center">
                <Loader2 size={16} className="text-white animate-spin" />
              </div>
              <div className="bg-white dark:bg-slate-800 px-5 py-4 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-1">
                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
              </div>
            </div>
          )}

          {error && (
            <div className="flex justify-center my-4 animate-fade-in">
              <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-4 py-2 rounded-lg text-sm flex items-center gap-2">
                <AlertCircle size={16} />
                {error}
              </div>
            </div>
          )}

          <div ref={messagesEndRef} className="h-4" />
        </div>
      </div>

      {/* Input Area */}
      <div className="p-4 lg:pb-8 lg:px-20 bg-gradient-to-t from-gray-50 via-gray-50 to-transparent dark:from-slate-900 dark:via-slate-900 dark:to-transparent z-10">
        <div className="max-w-4xl mx-auto relative">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-gray-200 dark:border-slate-700/50 p-2 flex items-end gap-2 transition-all focus-within:ring-2 focus-within:ring-az-blue/50 focus-within:border-az-blue/50">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={handleInput}
              onKeyDown={handleKeyDown}
              placeholder="Xaricdə təhsillə bağlı sualınızı yazın..."
              className="w-full bg-transparent border-none focus:ring-0 text-slate-800 dark:text-slate-100 placeholder-slate-400 resize-none max-h-32 py-3 pl-4 text-[15px] scrollbar-hide"
              rows={1}
              disabled={isLoading}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className={`p-3 rounded-xl flex-shrink-0 transition-all duration-300 ${input.trim() && !isLoading
                  ? 'bg-gradient-to-r from-az-blue to-blue-600 text-white shadow-lg hover:shadow-blue-500/30 transform hover:-translate-y-0.5'
                  : 'bg-gray-100 dark:bg-slate-700 text-slate-400 cursor-not-allowed'
                }`}
            >
              <Send size={20} className={input.trim() && !isLoading ? 'ml-0.5' : ''} />
            </button>
          </div>
          <p className="text-center text-xs text-slate-400 mt-2">
            AI səhv edə bilər. Məlumatları rəsmi mənbələrdən yoxlayın.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;