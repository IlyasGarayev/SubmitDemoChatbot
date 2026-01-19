import React from 'react';
import { LogOut, User as UserIcon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const UserProfile: React.FC = () => {
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <div className="mt-auto p-4 border-t border-slate-200 dark:border-slate-800">
      <div className="flex items-center gap-3 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50">
        
        {/* Avatar */}
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-az-blue to-blue-600 flex items-center justify-center overflow-hidden flex-shrink-0">
          {user.picture ? (
            <img src={user.picture} alt={user.name} className="w-full h-full object-cover" />
          ) : (
            <UserIcon className="text-white w-5 h-5" />
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
            {user.name || 'İstifadəçi'}
          </p>
          <p className="text-xs text-slate-500 truncate">
            {user.email}
          </p>
        </div>

        {/* Logout */}
        <button
          onClick={logout}
          className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
          title="Çıxış"
        >
          <LogOut size={18} />
        </button>
      </div>
    </div>
  );
};

export default UserProfile;