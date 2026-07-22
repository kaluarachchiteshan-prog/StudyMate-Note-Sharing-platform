'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile } from '@/types';
import { INITIAL_USER, MOCK_USERS } from '@/lib/mockData';
import { isFirebaseConfigured, auth } from '@/lib/firebase/config';
import { onAuthStateChanged } from 'firebase/auth';

interface Toast {
  id: string;
  message: string;
  type?: 'success' | 'info' | 'error';
}

interface AuthContextType {
  user: UserProfile | null;
  setUser: React.Dispatch<React.SetStateAction<UserProfile | null>>;
  isAuthenticated: boolean;
  isFirebaseActive: boolean;
  switchMockUser: (uid: string) => void;
  updateUserProfile: (updates: Partial<UserProfile>) => void;
  toasts: Toast[];
  showToast: (message: string, type?: 'success' | 'info' | 'error') => void;
  removeToast: (id: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(INITIAL_USER);
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    if (isFirebaseConfigured && auth) {
      const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
        if (firebaseUser) {
          setUser((prev) => ({
            uid: firebaseUser.uid,
            displayName: firebaseUser.displayName || 'Scholar',
            email: firebaseUser.email || '',
            photoURL: firebaseUser.photoURL || INITIAL_USER.photoURL,
            university: prev?.university || 'Stanford University',
            school: prev?.school || 'School of Engineering',
            major: prev?.major || 'Computer Science',
            enrolledCourses: prev?.enrolledCourses || ['CS106B', 'CS161'],
            bio: prev?.bio || 'Collaborative learner',
            reputationPoints: prev?.reputationPoints || 100,
            uploadedNotesCount: prev?.uploadedNotesCount || 0,
            savedBookmarkIds: prev?.savedBookmarkIds || [],
            joinedGroupIds: prev?.joinedGroupIds || [],
            createdAt: prev?.createdAt || '2026-01-01',
          }));
        }
      });
      return () => unsubscribe();
    }
  }, []);

  const switchMockUser = (uid: string) => {
    const found = MOCK_USERS.find(u => u.uid === uid);
    if (found) {
      setUser(found);
      showToast(`Switched user context to ${found.displayName}`, 'info');
    }
  };

  const updateUserProfile = (updates: Partial<UserProfile>) => {
    if (user) {
      const updated = { ...user, ...updates };
      setUser(updated);
      showToast('Profile updated successfully!', 'success');
    }
  };

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter(t => t.id !== id));
  };

  return (
    <AuthContext.Provider value={{
      user,
      setUser,
      isAuthenticated: Boolean(user),
      isFirebaseActive: isFirebaseConfigured,
      switchMockUser,
      updateUserProfile,
      toasts,
      showToast,
      removeToast,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
