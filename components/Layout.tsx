import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
import Sidebar from './Sidebar/Sidebar';
import Header from './Header/Header';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-slate-900 transition-colors duration-300">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-20 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed inset-y-0 left-0 z-30 w-72 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } bg-white dark:bg-slate-800 border-r border-gray-200 dark:border-slate-700/50 shadow-xl lg:shadow-none`}
      >
        <Sidebar onCloseMobile={() => setSidebarOpen(false)} />
      </aside>

      {/* Main Content */}
      <div className="flex flex-1 flex-col h-full relative">
        {/* Mobile Header Toggle */}
        <div className="lg:hidden absolute top-4 left-4 z-10">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur shadow-md text-slate-600 dark:text-slate-200"
          >
            <Menu size={24} />
          </button>
        </div>

        <Header />
        
        <main className="flex-1 overflow-hidden relative">
           {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;