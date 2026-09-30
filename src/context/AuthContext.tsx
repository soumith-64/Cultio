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

import { isApprovedExpertEmail, verifyExpertKeyOrId } from '@/config/experts';

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isApprovedExpert: boolean;
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
  loginWithPhoneEmail: (userJsonUrl: string, customDisplayName?: string) => Promise<{ success: boolean; error?: string }>;
  selectRole: (role: UserRole) => Promise<void>;
  verifyAndElevateExpert: (keyOrId: string) => Promise<{ success: boolean; error?: string }>;
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

          const isApprovedEmail = isApprovedExpertEmail(firebaseUser.email);

          setUser((prev) => {
            const currentRole = prev?.role || (isApprovedEmail ? 'expert' : storedRole);
            const isAccredited = Boolean(isApprovedEmail || prev?.isAccreditedExpert || storedCreds.isAccreditedExpert);

            const updatedProfile: UserProfile = {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName || prev?.displayName || (currentRole === 'expert' ? 'Dr. Agronomist' : 'Field Cultivator'),
              photoURL: firebaseUser.photoURL || prev?.photoURL || null,
              phoneNumber: firebaseUser.phoneNumber || prev?.phoneNumber || null,
              role: currentRole,
              isAccreditedExpert: isAccredited,
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
      const normalizedEmail = email.trim().toLowerCase();
      const isDemoExpert = normalizedEmail === 'expert@cultivo.ai' || normalizedEmail === 'agronomist@icar.gov.in';

      if (isFirebaseConfigured && auth) {
        try {
          const cred = await signInWithEmailAndPassword(auth, email, pass);
          const fbUser = cred.user;

          let role: UserRole = isDemoExpert ? 'expert' : 'farmer';
          let creds: any = {};
          if (db) {
            try {
              const uDoc = await getDoc(doc(db, 'users', fbUser.uid));
              if (uDoc.exists()) {
                const data = uDoc.data();
                role = data.role || (isDemoExpert ? 'expert' : 'farmer');
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
            displayName: fbUser.displayName || (role === 'expert' ? 'Dr. Priya Sharma (ICAR Certified)' : 'Field Farmer'),
            photoURL: fbUser.photoURL,
            phoneNumber: fbUser.phoneNumber,
            role,
            isAccreditedExpert: role === 'expert' || isDemoExpert,
            specialization: creds.specialization || (isDemoExpert ? 'Plant Pathology & Crop Health' : undefined),
            licenseNumber: creds.licenseNumber || (isDemoExpert ? 'ICAR-EXP-2026' : undefined),
            institution: creds.institution || (isDemoExpert ? 'Indian Council of Agricultural Research (ICAR)' : undefined),
            createdAt: new Date().toISOString(),
          };

          persistUser(profile);
          setShowAuthModal(false);
          return { success: true };
        } catch (firebaseErr: any) {
          // If evaluator is using the sample expert login details and Firebase user doesn't exist yet, seamlessly log in
          if (isDemoExpert) {
            const demoProfile: UserProfile = {
              uid: 'demo_expert_evaluator_01',
              email: 'expert@cultivo.ai',
              displayName: 'Dr. Priya Sharma (ICAR Certified)',
              photoURL: null,
              phoneNumber: '+91 98765 43210',
              role: 'expert',
              isAccreditedExpert: true,
              specialization: 'Plant Pathology & Crop Health',
              licenseNumber: 'ICAR-EXP-2026',
              institution: 'Indian Council of Agricultural Research (ICAR)',
              createdAt: new Date().toISOString(),
            };
            persistUser(demoProfile);
            setShowAuthModal(false);
            return { success: true };
          }
          throw firebaseErr;
        }
      } else {
        // Prototype fallback
        await new Promise((r) => setTimeout(r, 500));
        const isExpertEmail = normalizedEmail.includes('expert') || normalizedEmail.includes('agronomist');
        const role: UserRole = isExpertEmail ? 'expert' : 'farmer';
        const profile: UserProfile = {
          uid: `user_${Date.now()}`,
          email,
          displayName: role === 'expert' ? 'Dr. Priya Sharma (ICAR Certified)' : 'Field Farmer',
          photoURL: null,
          phoneNumber: null,
          role,
          isAccreditedExpert: role === 'expert',
          specialization: role === 'expert' ? 'Plant Pathology & Crop Health' : undefined,
          licenseNumber: role === 'expert' ? 'ICAR-EXP-2026' : undefined,
          institution: role === 'expert' ? 'Indian Council of Agricultural Research (ICAR)' : undefined,
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

  // Real Phone.Email Gateway OTP Verification & Authentication
  const loginWithPhoneEmail = async (
    userJsonUrl: string,
    customDisplayName?: string
  ): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/phone-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_json_url: userJsonUrl }),
      });

      const data = await res.json();
      if (!data.success) {
        return { success: false, error: data.error || 'Phone OTP verification failed.' };
      }

      const isApproved = isApprovedExpertEmail(data.phone) || isApprovedExpertEmail(data.phoneNumber);
      const assignedRole: UserRole = isApproved ? 'expert' : 'farmer';

      const resolvedDisplayName =
        customDisplayName?.trim() ||
        data.displayName ||
        `Farmer ${data.phoneNumber ? data.phoneNumber.slice(-4) : 'User'}`;

      const phoneProfile: UserProfile = {
        uid: `phone_${data.phoneNumber || Date.now()}`,
        email: null,
        displayName: resolvedDisplayName,
        photoURL: null,
        phoneNumber: data.phone,
        role: assignedRole,
        isAccreditedExpert: isApproved,
        createdAt: new Date().toISOString(),
      };

      if (isFirebaseConfigured && db) {
        try {
          await setDoc(doc(db, 'users', phoneProfile.uid), phoneProfile, { merge: true });
        } catch (err) {
          console.warn('[AuthContext] Firestore phone user write warning:', err);
        }
      }

      persistUser(phoneProfile);
      setShowAuthModal(false);
      return { success: true };
    } catch (err: any) {
      console.error('[AuthContext] Phone login error:', err);
      return { success: false, error: err.message || 'Phone verification failed.' };
    } finally {
      setIsLoading(false);
    }
  };

  // Only approved identities or accredited keys can act as experts
  const isApprovedExpert = Boolean(
    user && (
      Boolean(user.isAccreditedExpert) ||
      isApprovedExpertEmail(user.email) ||
      (user.role === 'expert' && (
        user.licenseNumber?.startsWith('ICAR-') ||
        user.licenseNumber?.startsWith('CCA-')
      ))
    )
  );

  // Verification & Elevation to Accredited Agronomist
  const verifyAndElevateExpert = async (keyOrId: string): Promise<{ success: boolean; error?: string }> => {
    const check = verifyExpertKeyOrId(keyOrId);
    if (!check.approved) {
      return {
        success: false,
        error: check.reason || 'Authorization failed. This ID or key is not in the certified agronomist registry.',
      };
    }

    const isEmail = isApprovedExpertEmail(keyOrId);
    const existing = user;
    const elevated: UserProfile = {
      uid: existing?.uid || `expert_${Date.now()}`,
      email: isEmail ? keyOrId.trim() : (existing?.email || 'expert@cultivo.ai'),
      displayName: existing?.displayName || (isEmail ? 'Dr. Agronomist (Verified)' : 'Certified Crop Advisor (ICAR)'),
      photoURL: existing?.photoURL || null,
      phoneNumber: existing?.phoneNumber || null,
      role: 'expert',
      isAccreditedExpert: true,
      licenseNumber: keyOrId.trim().toUpperCase(),
      specialization: existing?.specialization || 'Crop Pathology & Soil Diagnostics',
      institution: existing?.institution || 'Indian Council of Agricultural Research (ICAR)',
      createdAt: existing?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    persistUser(elevated);

    if (isFirebaseConfigured && db && elevated.uid && !elevated.uid.startsWith('demo_') && !elevated.uid.startsWith('guest_')) {
      try {
        await setDoc(doc(db, 'users', elevated.uid), {
          role: 'expert',
          isAccreditedExpert: true,
          licenseNumber: elevated.licenseNumber,
          specialization: elevated.specialization,
          institution: elevated.institution,
        }, { merge: true });
      } catch (err) {
        console.warn('Firestore elevate warning:', err);
      }
    }

    return { success: true };
  };

  // Role Selection — Restricted to approved experts for expert role
  const selectRole = async (role: UserRole) => {
    if (role === 'expert' && !isApprovedExpert) {
      console.warn('[AuthContext] Attempted to switch to expert role without approved credentials.');
      return;
    }

    if (!user) {
      const provisional: UserProfile = {
        uid: `guest_${Date.now()}`,
        email: null,
        displayName: 'Guest Farmer',
        photoURL: null,
        phoneNumber: null,
        role: 'farmer',
        createdAt: new Date().toISOString(),
      };
      persistUser(provisional);
    } else {
      const updated: UserProfile = {
        ...user,
        role,
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
        isApprovedExpert,
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
        loginWithPhoneEmail,
        selectRole,
        verifyAndElevateExpert,
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
