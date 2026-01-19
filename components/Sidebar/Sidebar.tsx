import React from 'react';
import { useChat } from '../../context/ChatContext';
import { Plus, MessageSquare, Trash2, X, GraduationCap } from 'lucide-react';
import UserProfile from './UserProfile';

interface SidebarProps {
  onCloseMobile: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onCloseMobile }) => {
  const { threads, currentThreadId, createNewThread, selectThread, deleteThread } = useChat();

  const handleNewChat = () => {
    createNewThread();
    onCloseMobile();
  };

  const handleSelect = (id: string) => {
    selectThread(id);
    onCloseMobile();
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900/50 backdrop-blur-xl">
      {/* Brand */}
      <div className="p-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-az-blue via-az-red to-az-green flex items-center justify-center shadow-lg shadow-az-blue/20">
                <GraduationCap className="text-white w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400">
                TəhsilBot
            </h1>
        </div>
        <button onClick={onCloseMobile} className="lg:hidden text-slate-500">
            <X size={24} />
        </button>
      </div>

      {/* New Chat Button */}
      <div className="px-4 pb-4">
        <button
          onClick={handleNewChat}
          className="w-full flex items-center gap-2 px-4 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl hover:opacity-90 transition-all shadow-lg active:scale-95 font-medium"
        >
          <Plus size={20} />
          <span>Yeni Söhbət</span>
        </button>
      </div>

      {/* Thread List */}
      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-1 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700">
        <h2 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3 px-2">
            Keçmiş Söhbətlər
        </h2>
        {threads.map((thread) => (
          <div
            key={thread.id}
            className={`group relative flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all duration-200 border border-transparent ${
              currentThreadId === thread.id
                ? 'bg-az-blue/10 border-az-blue/20 dark:bg-slate-800 dark:border-slate-700'
                : 'hover:bg-slate-100 dark:hover:bg-slate-800/50'
            }`}
            onClick={() => handleSelect(thread.id)}
          >
            <MessageSquare 
                size={18} 
                className={`${currentThreadId === thread.id ? 'text-az-blue' : 'text-slate-400 dark:text-slate-500'}`} 
            />
            <span className={`text-sm truncate flex-1 ${currentThreadId === thread.id ? 'font-medium text-slate-900 dark:text-slate-100' : 'text-slate-600 dark:text-slate-400'}`}>
              {thread.title}
            </span>
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                deleteThread(thread.id);
              }}
              className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-md text-slate-400 hover:text-red-500 transition-all"
              title="Delete chat"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>

      {/* User Profile */}
      <UserProfile />

      {/* Footer Info */}
      <div className="p-2 text-center">
         <p className="text-[10px] text-slate-400">Azərbaycan Gəncləri üçün 🇦🇿</p>
      </div>
    </div>
  );
};

export default Sidebar;