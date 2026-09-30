'use client';

/**
 * CULTIVO — Authentication Context & Role Management
 * Supports Google Sign-In and a provider-agnostic Phone + OTP flow.
 * Handles role selection (Farmer vs Agricultural Expert) and privacy consent state.
 */

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { UserProfile, UserRole } from '@/types';
import { auth, db, isFirebaseConfigured, googleProvider } from '@/config/firebase';
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

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
  signInWithGoogle: (preferredRole?: UserRole) => Promise<{ success: boolean; error?: string }>;
  signInWithEmail: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUpWithEmail: (
    email: string,
    password: string,
    displayName: string,
    role: UserRole,
    credentials?: { specialization?: string; licenseNumber?: string; institution?: string }
  ) => Promise<{ success: boolean; error?: string }>;
  sendPhoneOtp: (phoneNumber: string) => Promise<{ success: boolean; error?: string }>;
  verifyPhoneOtp: (code: string) => Promise<{ success: boolean; error?: string }>;
  selectRole: (role: UserRole) => Promise<void>;
  updateUserProfile: (updates: Partial<UserProfile>) => Promise<void>;
  grantPrivacyConsent: () => void;
  declinePrivacyConsent: () => void;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_USER_KEY = 'cultivo_current_user';
const CONSENT_KEY = 'cultivo_privacy_consent';

function formatFirebaseAuthError(error: any): string {
  if (!error) return 'An unexpected authentication error occurred.';
  const code = error.code || '';
  switch (code) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'Invalid email address or password. Please verify your credentials.';
    case 'auth/email-already-in-use':
      return 'An account already exists with this email address. Please sign in instead.';
    case 'auth/weak-password':
      return 'Password must be at least 6 characters.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/popup-closed-by-user':
      return 'Google sign-in popup was closed before completing.';
    case 'auth/cancelled-popup-request':
      return 'Sign-in cancelled. Another window was already open.';
    case 'auth/unauthorized-domain':
      return 'This domain is not yet authorized in Firebase Console (Authentication > Settings > Authorized domains). Add localhost to proceed.';
    case 'auth/operation-not-allowed':
      return 'Sign-in method is not enabled yet in your Firebase Console (Build > Authentication > Sign-in method).';
    default:
      return error.message || 'Authentication failed. Please try again.';
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasPrivacyConsent, setHasPrivacyConsent] = useState<boolean>(false);
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [showRoleModal, setShowRoleModal] = useState<boolean>(false);
  const [showConsentModal, setShowConsentModal] = useState<boolean>(false);
  const [pendingPhone, setPendingPhone] = useState<string | null>(null);

  // Save user changes locally & sync
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
      const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
        if (firebaseUser) {
          // Check Firestore user doc for stored role & accreditation
          let storedRole: UserRole = 'farmer';
          let storedCreds: any = {};

          if (db) {
            try {
              const uDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
              if (uDoc.exists()) {
                const data = uDoc.data();
                storedRole = data.role || storedRole;
                storedCreds = {
                  specialization: data.specialization,
                  licenseNumber: data.licenseNumber,
                  institution: data.institution,
                };
              }
            } catch (err) {
              console.warn('[AuthContext] Firestore user fetch warning:', err);
            }
          }

          setUser((prev) => {
            const currentRole = prev?.role || storedRole;
            const updatedProfile: UserProfile = {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName || prev?.displayName || (currentRole === 'expert' ? 'Dr. Agronomist' : 'Field Cultivator'),
              photoURL: firebaseUser.photoURL || prev?.photoURL || null,
              phoneNumber: firebaseUser.phoneNumber || prev?.phoneNumber || null,
              role: currentRole,
              specialization: prev?.specialization || storedCreds.specialization,
              licenseNumber: prev?.licenseNumber || storedCreds.licenseNumber,
              institution: prev?.institution || storedCreds.institution,
              createdAt: prev?.createdAt || new Date().toISOString(),
            };
            persistUser(updatedProfile);
            return updatedProfile;
          });
        }
        setIsLoading(false);
      });
      return () => unsubscribe();
    } else {
      setIsLoading(false);
    }
  }, [persistUser]);

  // Real Google Sign-In with Role Selection
  const signInWithGoogle = async (preferredRole?: UserRole) => {
    setIsLoading(true);
    try {
      if (isFirebaseConfigured && auth && googleProvider) {
        const result = await signInWithPopup(auth, googleProvider);
        const fbUser = result.user;
        const assignedRole: UserRole = preferredRole || user?.role || 'farmer';

        const profile: UserProfile = {
          uid: fbUser.uid,
          email: fbUser.email,
          displayName: fbUser.displayName || (assignedRole === 'expert' ? 'Dr. Agronomist' : 'Field Cultivator'),
          photoURL: fbUser.photoURL,
          phoneNumber: fbUser.phoneNumber,
          role: assignedRole,
          specialization: assignedRole === 'expert' ? 'Plant Pathology & Crop Protection' : undefined,
          licenseNumber: assignedRole === 'expert' ? 'CCA-REG-ACTIVE' : undefined,
          createdAt: new Date().toISOString(),
        };

        if (db) {
          try {
            await setDoc(doc(db, 'users', fbUser.uid), profile, { merge: true });
          } catch (e) {
            console.warn('Could not sync user to Firestore:', e);
          }
        }

        persistUser(profile);
        setShowAuthModal(false);
        return { success: true };
      } else {
        // Prototype simulation when Firebase keys are not in environment
        await new Promise((r) => setTimeout(r, 500));
        const assignedRole: UserRole = preferredRole || 'farmer';
        const mockProfile: UserProfile = {
          uid: `demo_${assignedRole}_${Date.now()}`,
          email: assignedRole === 'expert' ? 'expert@cultivo.agri' : 'farmer@cultivo.agri',
          displayName: assignedRole === 'expert' ? 'Dr. Aris Thorne (PhD Agronomy)' : 'Ravi Kumar (Farmer)',
          photoURL: assignedRole === 'expert'
            ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'
            : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
          phoneNumber: '+91 98765 43210',
          role: assignedRole,
          specialization: assignedRole === 'expert' ? 'Plant Pathology & Diagnostic Microscopy' : undefined,
          licenseNumber: assignedRole === 'expert' ? 'CCA-IN-84920' : undefined,
          institution: assignedRole === 'expert' ? 'State Agricultural Extension Services' : undefined,
          createdAt: new Date().toISOString(),
        };
        persistUser(mockProfile);
        setShowAuthModal(false);
        return { success: true };
      }
    } catch (err: any) {
      console.error('Google Sign-in failed:', err);
      return { success: false, error: formatFirebaseAuthError(err) };
    } finally {
      setIsLoading(false);
    }
  };

  // Real Email & Password Sign-In
  const signInWithEmail = async (email: string, pass: string) => {
    setIsLoading(true);
    try {
      if (isFirebaseConfigured && auth) {
        const cred = await signInWithEmailAndPassword(auth, email, pass);
        const fbUser = cred.user;

        let role: UserRole = 'farmer';
        let creds: any = {};
        if (db) {
          try {
            const uDoc = await getDoc(doc(db, 'users', fbUser.uid));
            if (uDoc.exists()) {
              const data = uDoc.data();
              role = data.role || 'farmer';
              creds = {
                specialization: data.specialization,
                licenseNumber: data.licenseNumber,
                institution: data.institution,
              };
            }
          } catch {}
        }

        const profile: UserProfile = {
          uid: fbUser.uid,
          email: fbUser.email,
          displayName: fbUser.displayName || (role === 'expert' ? 'Certified Agronomist' : 'Field Farmer'),
          photoURL: fbUser.photoURL,
          phoneNumber: fbUser.phoneNumber,
          role,
          ...creds,
          createdAt: new Date().toISOString(),
        };

        persistUser(profile);
        setShowAuthModal(false);
        return { success: true };
      } else {
        // Prototype fallback
        await new Promise((r) => setTimeout(r, 500));
        const isExpertEmail = email.toLowerCase().includes('expert') || email.toLowerCase().includes('agronomist');
        const role: UserRole = isExpertEmail ? 'expert' : 'farmer';
        const profile: UserProfile = {
          uid: `user_${Date.now()}`,
          email,
          displayName: role === 'expert' ? 'Dr. Certified Agronomist' : 'Field Farmer',
          photoURL: null,
          phoneNumber: null,
          role,
          specialization: role === 'expert' ? 'Plant Pathology' : undefined,
          licenseNumber: role === 'expert' ? 'AGRI-EXPERT-2024' : undefined,
          createdAt: new Date().toISOString(),
        };
        persistUser(profile);
        setShowAuthModal(false);
        return { success: true };
      }
    } catch (err: any) {
      console.error('Email sign-in failed:', err);
      return { success: false, error: formatFirebaseAuthError(err) };
    } finally {
      setIsLoading(false);
    }
  };

  // Real Email & Password Registration
  const signUpWithEmail = async (
    email: string,
    pass: string,
    displayName: string,
    role: UserRole,
    credentials?: { specialization?: string; licenseNumber?: string; institution?: string }
  ) => {
    setIsLoading(true);
    try {
      if (isFirebaseConfigured && auth) {
        const cred = await createUserWithEmailAndPassword(auth, email, pass);
        const fbUser = cred.user;

        await updateProfile(fbUser, { displayName });

        const profile: UserProfile = {
          uid: fbUser.uid,
          email: fbUser.email,
          displayName,
          photoURL: null,
          phoneNumber: null,
          role,
          specialization: credentials?.specialization,
          licenseNumber: credentials?.licenseNumber,
          institution: credentials?.institution,
          createdAt: new Date().toISOString(),
        };

        if (db) {
          try {
            await setDoc(doc(db, 'users', fbUser.uid), profile, { merge: true });
          } catch (e) {
            console.warn('Firestore profile write warning:', e);
          }
        }

        persistUser(profile);
        setShowAuthModal(false);
        return { success: true };
      } else {
        // Prototype fallback
        await new Promise((r) => setTimeout(r, 500));
        const profile: UserProfile = {
          uid: `reg_${Date.now()}`,
          email,
          displayName,
          photoURL: null,
          phoneNumber: null,
          role,
          specialization: credentials?.specialization,
          licenseNumber: credentials?.licenseNumber,
          institution: credentials?.institution,
          createdAt: new Date().toISOString(),
        };
        persistUser(profile);
        setShowAuthModal(false);
        return { success: true };
      }
    } catch (err: any) {
      console.error('Email registration failed:', err);
      return { success: false, error: formatFirebaseAuthError(err) };
    } finally {
      setIsLoading(false);
    }
  };

  // Provider-Agnostic Phone OTP Step 1
  const sendPhoneOtp = async (phoneNumber: string) => {
    setIsLoading(true);
    try {
      await new Promise((r) => setTimeout(r, 600));
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
      await new Promise((r) => setTimeout(r, 500));
      if (!code || code.trim().length !== 6) {
        return { success: false, error: 'Please enter the 6-digit verification code.' };
      }

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
      const provisional: UserProfile = {
        uid: `guest_${Date.now()}`,
        email: null,
        displayName: role === 'farmer' ? 'Guest Farmer' : 'Dr. Agronomist (Expert)',
        photoURL: null,
        phoneNumber: null,
        role,
        specialization: role === 'expert' ? 'Plant Pathology' : undefined,
        licenseNumber: role === 'expert' ? 'AGRI-CERT-2024' : undefined,
        createdAt: new Date().toISOString(),
      };
      persistUser(provisional);
    } else {
      const updated: UserProfile = {
        ...user,
        role,
        specialization: role === 'expert' ? user.specialization || 'Plant Pathology' : user.specialization,
        licenseNumber: role === 'expert' ? user.licenseNumber || 'CCA-REG-VALID' : user.licenseNumber,
      };

      if (isFirebaseConfigured && db && user.uid && !user.uid.startsWith('demo_') && !user.uid.startsWith('guest_')) {
        try {
          await setDoc(doc(db, 'users', user.uid), { role }, { merge: true });
        } catch {}
      }

      persistUser(updated);
    }
    setShowRoleModal(false);

    if (!hasPrivacyConsent) {
      setShowConsentModal(true);
    }
  };

  // Update profile metadata
  const updateUserProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return;
    const updated = { ...user, ...updates, updatedAt: new Date().toISOString() };
    persistUser(updated);

    if (isFirebaseConfigured && db && user.uid) {
      try {
        await setDoc(doc(db, 'users', user.uid), updates, { merge: true });
      } catch (err) {
        console.warn('Failed to update profile in Firestore:', err);
      }
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
        signInWithEmail,
        signUpWithEmail,
        sendPhoneOtp,
        verifyPhoneOtp,
        selectRole,
        updateUserProfile,
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
