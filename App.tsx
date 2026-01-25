import React from 'react';
import { Loader2 } from 'lucide-react';
import { ThemeProvider } from './context/ThemeContext';
import { ChatProvider } from './context/ChatContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import ChatInterface from './components/Chat/ChatInterface';
import LoginPage from './components/Auth/LoginPage';

const AppContent: React.FC = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-gray-50 dark:bg-slate-900">
        <Loader2 className="w-10 h-10 text-az-blue animate-spin" />
      </div>
    );
  }

  return user ? (
    <ChatProvider>
      <Layout>
        <ChatInterface />
      </Layout>
    </ChatProvider>
  ) : (
    <LoginPage />
  );
};

const App: React.FC = () => {
  console.log("App component is rendering...");
  
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;