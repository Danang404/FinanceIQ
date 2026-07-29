"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password?: string) => void;
  register: (name: string, email: string, password?: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check localStorage on mount for active session
    const storedUser = localStorage.getItem('financeiq_active_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error("Failed to parse stored active user", e);
      }
    }
    setIsLoading(false);
  }, []);

  const getStoredUsers = () => {
    try {
      const users = localStorage.getItem('financeiq_users_db');
      return users ? JSON.parse(users) : [];
    } catch {
      return [];
    }
  };

  const register = (name: string, email: string, password?: string) => {
    const users = getStoredUsers();
    
    // Check if email already exists
    const userExists = users.some((u: any) => u.email === email);
    if (userExists) {
      throw new Error("Email sudah terdaftar. Silakan masuk (login).");
    }

    // Mock ID & User object
    const mockId = `user_${btoa(email).slice(0, 8).toLowerCase()}`;
    const newUser = { id: mockId, name, email, password };
    
    // Save to users DB
    users.push(newUser);
    localStorage.setItem('financeiq_users_db', JSON.stringify(users));

    // Auto login after register
    const activeUser = { id: mockId, name, email };
    setUser(activeUser);
    localStorage.setItem('financeiq_active_user', JSON.stringify(activeUser));
    router.push('/beranda');
  };

  const login = (email: string, password?: string) => {
    const users = getStoredUsers();
    
    // Find user by email and password
    const foundUser = users.find((u: any) => u.email === email && u.password === password);
    
    if (!foundUser) {
      throw new Error("Email atau password salah.");
    }

    const activeUser = { id: foundUser.id, name: foundUser.name, email: foundUser.email };
    setUser(activeUser);
    localStorage.setItem('financeiq_active_user', JSON.stringify(activeUser));
    router.push('/beranda');
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('financeiq_active_user');
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      isLoading,
      login,
      register,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}
