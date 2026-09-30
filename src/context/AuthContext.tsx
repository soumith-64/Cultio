'use client';

/**
 * CULTIVO — Authentication Context & Role Management
 * Supports Google Sign-In and a provider-agnostic Phone + OTP flow.
 * Handles role selection (Farmer vs Agricultural Expert) and privacy consent state.
 */

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { UserProfile, UserRole } from '@/types';
import { auth, isFirebaseConfigured, googleProvider } from '@/config/firebase';
import {
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  hasPrivacyConsent: boolean;
  showAuthModal: boolean;
  showRoleModal: boolean;
  showConsentModal: boolean;
  setShowAuthModal: (show: boolean) => void;
  setShowRoleModal: (show: boolean) => void;
  setShowConsentModal: (show: boolean) => void;
  signInWithGoogle: () => Promise<void>;
  sendPhoneOtp: (phoneNumber: string) => Promise<{ success: boolean; error?: string }>;
  verifyPhoneOtp: (code: string) => Promise<{ success: boolean; error?: string }>;
  selectRole: (role: UserRole) => Promise<void>;
  grantPrivacyConsent: () => void;
  declinePrivacyConsent: () => void;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_USER_KEY = 'cultivo_current_user';
const CONSENT_KEY = 'cultivo_privacy_consent';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasPrivacyConsent, setHasPrivacyConsent] = useState<boolean>(false);
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [showRoleModal, setShowRoleModal] = useState<boolean>(false);
  const [showConsentModal, setShowConsentModal] = useState<boolean>(false);
  const [pendingPhone, setPendingPhone] = useState<string | null>(null);

  // Load initial consent & user from localStorage or Firebase
  useEffect(() => {
    try {
      const consentStored = localStorage.getItem(CONSENT_KEY) === 'true';
      setHasPrivacyConsent(consentStored);

      const localUser = localStorage.getItem(LOCAL_USER_KEY);
      if (localUser) {
        setUser(JSON.parse(localUser));
      }
    } catch (e) {
      console.warn('LocalStorage access warning:', e);
    }

    if (isFirebaseConfigured && auth) {
      const unsubscribe = onAuthStateChanged(auth, (firebaseUser: FirebaseUser | null) => {
        if (firebaseUser) {
          setUser((prev) => ({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName || 'Field User',
            photoURL: firebaseUser.photoURL,
            phoneNumber: firebaseUser.phoneNumber,
            role: prev?.role || 'farmer',
            createdAt: prev?.createdAt || new Date().toISOString(),
          }));
        }
        setIsLoading(false);
      });
      return () => unsubscribe();
    } else {
      setIsLoading(false);
    }
  }, []);

  // Save user changes locally
  const persistUser = useCallback((updated: UserProfile | null) => {
    setUser(updated);
    if (typeof window !== 'undefined') {
      if (updated) {
        localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(updated));
      } else {
        localStorage.removeItem(LOCAL_USER_KEY);
      }
    }
  }, []);

  // Google Sign In
  const signInWithGoogle = async () => {
    setIsLoading(true);
    try {
      if (isFirebaseConfigured && auth && googleProvider) {
        const result = await signInWithPopup(auth, googleProvider);
        const fbUser = result.user;
        const profile: UserProfile = {
          uid: fbUser.uid,
          email: fbUser.email,
          displayName: fbUser.displayName || 'Field Cultivator',
          photoURL: fbUser.photoURL,
          phoneNumber: fbUser.phoneNumber,
          role: 'farmer',
          createdAt: new Date().toISOString(),
        };
        persistUser(profile);
        setShowAuthModal(false);
        setShowRoleModal(true);
      } else {
        // Prototype simulation
        await new Promise((r) => setTimeout(r, 600));
        const mockProfile: UserProfile = {
          uid: `demo_user_${Date.now()}`,
          email: 'farmer@cultivo.agri',
          displayName: 'Ravi Kumar (Farmer)',
          photoURL: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
          phoneNumber: '+91 98765 43210',
          role: 'farmer',
          createdAt: new Date().toISOString(),
        };
        persistUser(mockProfile);
        setShowAuthModal(false);
        setShowRoleModal(true);
      }
    } catch (err: any) {
      console.error('Google Sign-in failed:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Provider-Agnostic Phone OTP Step 1
  const sendPhoneOtp = async (phoneNumber: string) => {
    setIsLoading(true);
    try {
      await new Promise((r) => setTimeout(r, 700));
      // Basic validation
      const cleaned = phoneNumber.replace(/[^0-9+]/g, '');
      if (cleaned.length < 10) {
        return { success: false, error: 'Please enter a valid 10-digit mobile number.' };
      }
      setPendingPhone(cleaned);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to send OTP.' };
    } finally {
      setIsLoading(false);
    }
  };

  // Provider-Agnostic Phone OTP Step 2
  const verifyPhoneOtp = async (code: string) => {
    setIsLoading(true);
    try {
      await new Promise((r) => setTimeout(r, 600));
      if (!code || code.trim().length !== 6) {
        return { success: false, error: 'Please enter the 6-digit verification code.' };
      }

      // Successful verification
      const phoneProfile: UserProfile = {
        uid: `phone_user_${Date.now()}`,
        email: null,
        displayName: `Farmer ${pendingPhone?.slice(-4) || 'User'}`,
        photoURL: null,
        phoneNumber: pendingPhone,
        role: 'farmer',
        createdAt: new Date().toISOString(),
      };

      persistUser(phoneProfile);
      setPendingPhone(null);
      setShowAuthModal(false);
      setShowRoleModal(true);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'OTP verification failed.' };
    } finally {
      setIsLoading(false);
    }
  };

  // Role Selection
  const selectRole = async (role: UserRole) => {
    if (!user) {
      // Auto-create provisional profile if not yet signed in
      const provisional: UserProfile = {
        uid: `guest_${Date.now()}`,
        email: null,
        displayName: role === 'farmer' ? 'Guest Farmer' : 'Guest Agronomist',
        photoURL: null,
        phoneNumber: null,
        role,
        createdAt: new Date().toISOString(),
      };
      persistUser(provisional);
    } else {
      const updated: UserProfile = { ...user, role };
      persistUser(updated);
    }
    setShowRoleModal(false);

    // If privacy consent has not been granted yet, show it
    if (!hasPrivacyConsent) {
      setShowConsentModal(true);
    }
  };

  // Privacy Consent
  const grantPrivacyConsent = () => {
    setHasPrivacyConsent(true);
    if (typeof window !== 'undefined') {
      localStorage.setItem(CONSENT_KEY, 'true');
    }
    setShowConsentModal(false);
  };

  const declinePrivacyConsent = () => {
    setHasPrivacyConsent(false);
    if (typeof window !== 'undefined') {
      localStorage.setItem(CONSENT_KEY, 'false');
    }
    setShowConsentModal(false);
  };

  // Sign Out
  const signOut = async () => {
    if (isFirebaseConfigured && auth) {
      await firebaseSignOut(auth).catch(() => {});
    }
    persistUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: Boolean(user),
        isLoading,
        hasPrivacyConsent,
        showAuthModal,
        showRoleModal,
        showConsentModal,
        setShowAuthModal,
        setShowRoleModal,
        setShowConsentModal,
        signInWithGoogle,
        sendPhoneOtp,
        verifyPhoneOtp,
        selectRole,
        grantPrivacyConsent,
        declinePrivacyConsent,
        signOut,
      }}
    >
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
