import React, { useState } from 'react';
import { Message, MessageType } from '../../types';
import { Bot, User, Pencil, Check, X, Copy } from 'lucide-react';
import { useChat } from '../../context/ChatContext';

interface MessageBubbleProps {
  message: Message;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isAi = message.type === MessageType.AI;
  const { editMessage } = useChat();
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);

  const handleEditSave = async () => {
    if (editContent.trim() !== message.content) {
      if (message.messageId) {
        try {
          await editMessage(message.messageId, editContent);
        } catch (error) {
          console.error('Failed to edit message:', error);
        }
      } else {
        console.error("Message ID is missing for the message being edited:", message);
      }
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditContent(message.content);
    setIsEditing(false);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(message.content);
  };

  return (
    <div className={`group flex gap-4 w-full ${isAi ? 'justify-start' : 'justify-end'} animate-slide-up mb-6`}>
      {/* AI Avatar */}
      {isAi && (
        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-az-blue to-az-green flex items-center justify-center shadow-lg shadow-az-blue/20 flex-shrink-0 mt-1">
          <Bot size={16} className="text-white" />
        </div>
      )}

      <div className={`max-w-[85%] lg:max-w-[70%] relative`}>
        {/* Actions for User Message */}
        {!isAi && !isEditing && (
            <div className="absolute -left-16 top-0 h-full flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity pr-2">
                <button 
                    onClick={() => setIsEditing(true)}
                    className="p-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-az-blue transition-colors shadow-sm"
                    title="Edit and Branch"
                >
                    <Pencil size={14} />
                </button>
            </div>
        )}

        {/* Message Content */}
        {isEditing ? (
            <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-xl border border-az-blue/50 w-full min-w-[300px]">
                <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="w-full bg-transparent border-0 focus:ring-0 text-slate-800 dark:text-slate-100 resize-none p-0 text-sm font-sans"
                    rows={3}
                    autoFocus
                />
                <div className="flex justify-end gap-2 mt-3 pt-2 border-t border-slate-100 dark:border-slate-700">
                    <button 
                        onClick={handleCancel}
                        className="px-3 py-1 text-xs font-medium text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                    >
                        Ləğv et
                    </button>
                    <button 
                        onClick={handleEditSave}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-az-blue text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                        <Check size={12} />
                        Yenilə
                    </button>
                </div>
            </div>
        ) : (
            <div
            className={`px-5 py-3.5 rounded-2xl text-[15px] leading-relaxed shadow-sm relative ${
                isAi
                ? 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-tl-none border border-slate-200/50 dark:border-slate-700/50'
                : 'bg-slate-900 dark:bg-az-blue text-white rounded-tr-none bg-gradient-to-br from-slate-900 to-slate-800 dark:from-az-blue dark:to-blue-600'
            }`}
            >
            <p className="whitespace-pre-wrap">{message.content}</p>
            
            {/* Timestamp & Actions */}
            <div className={`flex items-center gap-2 mt-1 ${isAi ? 'justify-start' : 'justify-end'}`}>
                 <span className={`text-[10px] opacity-60`}>
                    {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                 </span>
                 {isAi && (
                     <button onClick={copyToClipboard} className="opacity-0 group-hover:opacity-60 hover:opacity-100 transition-opacity">
                         <Copy size={12} />
                     </button>
                 )}
            </div>
            </div>
        )}
      </div>

      {/* User Avatar */}
      {!isAi && (
        <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center flex-shrink-0 mt-1">
          <User size={16} className="text-slate-500 dark:text-slate-400" />
        </div>
      )}
    </div>
  );
};

export default MessageBubble;