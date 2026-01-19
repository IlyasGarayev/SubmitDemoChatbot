import React, { createContext, useContext, useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import { User } from '../types';
import { API_BASE_URL } from '../constants';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check URL for token (callback from Google Login)
    const urlParams = new URLSearchParams(window.location.search);
    const tokenFromUrl = urlParams.get('token');

    if (tokenFromUrl) {
      handleToken(tokenFromUrl);
      // Clean URL
      window.history.replaceState({}, document.title, window.location.pathname);
    } else {
      // Check localStorage
      const savedToken = localStorage.getItem('access_token');
      if (savedToken) {
        handleToken(savedToken);
      } else {
        setIsLoading(false);
      }
    }
  }, []);

  const handleToken = (accessToken: string) => {
    try {
      const decoded: User = jwtDecode(accessToken);
      // Check expiration
      if (decoded.exp && decoded.exp * 1000 < Date.now()) {
        logout();
        return;
      }
      setToken(accessToken);
      setUser(decoded);
      localStorage.setItem('access_token', accessToken);
    } catch (error) {
      console.error("Invalid token:", error);
      logout();
    } finally {
      setIsLoading(false);
    }
  };

  const login = () => {
    // Redirect to backend Google Auth endpoint
    // Assuming the backend endpoint is /auth/login/google based on the prompt
    window.location.href = `${API_BASE_URL}/auth/login/google`;
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    setToken(null);
    setUser(null);
    setIsLoading(false);
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};