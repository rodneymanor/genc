'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { auth } from '@/lib/firebase'; // db will be used via our new functions
import {
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail as firebaseSendPasswordResetEmail, // Renamed to avoid conflict
} from 'firebase/auth';
import { Timestamp } from 'firebase/firestore'; 

// Import our new Firestore functions and types
import {
  getDocument, 
  setDocument, 
  updateDocument,
  COLLECTIONS 
} from '@/lib/firestore';
import type { UserProfile } from '@/lib/types/firestore'; // Use the centrally defined UserProfile

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null; // Use imported UserProfile type
  loading: boolean;
  profileLoading: boolean; // Separate loading state for profile
  signup: (email: string, password: string, firstName: string, lastName: string) => Promise<User | null>; // Make firstName and lastName required
  login: (email: string, password: string) => Promise<User | null>; // Return User
  logout: () => Promise<void>;
  sendPasswordResetEmail: (email: string) => Promise<void>;
  fetchUserProfile: (uid: string) => Promise<UserProfile | null>; // Add a function to explicitly fetch profile
}

// Cache keys for localStorage
const CACHE_KEYS = {
  USER_PROFILE: 'genC_userProfile',
  USER_AUTH: 'genC_userAuth',
} as const;

// Helper functions for localStorage
const getCachedUserProfile = (): UserProfile | null => {
  if (typeof window === 'undefined') return null;
  try {
    const cached = localStorage.getItem(CACHE_KEYS.USER_PROFILE);
    return cached ? JSON.parse(cached) : null;
  } catch (error) {
    console.warn('Failed to parse cached user profile:', error);
    return null;
  }
};

const setCachedUserProfile = (profile: UserProfile | null): void => {
  if (typeof window === 'undefined') return;
  try {
    if (profile) {
      localStorage.setItem(CACHE_KEYS.USER_PROFILE, JSON.stringify(profile));
    } else {
      localStorage.removeItem(CACHE_KEYS.USER_PROFILE);
    }
  } catch (error) {
    console.warn('Failed to cache user profile:', error);
  }
};

const getCachedUserAuth = (): { uid: string; email: string | null; displayName: string | null } | null => {
  if (typeof window === 'undefined') return null;
  try {
    const cached = localStorage.getItem(CACHE_KEYS.USER_AUTH);
    return cached ? JSON.parse(cached) : null;
  } catch (error) {
    console.warn('Failed to parse cached user auth:', error);
    return null;
  }
};

const setCachedUserAuth = (user: User | null): void => {
  if (typeof window === 'undefined') return;
  try {
    if (user) {
      localStorage.setItem(CACHE_KEYS.USER_AUTH, JSON.stringify({
        uid: user.uid,
        email: user.email,
        displayName: user.displayName
      }));
    } else {
      localStorage.removeItem(CACHE_KEYS.USER_AUTH);
    }
  } catch (error) {
    console.warn('Failed to cache user auth:', error);
  }
};

// Export AuthContext directly
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null); // Use imported UserProfile type
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load cached data immediately on mount
  useEffect(() => {
    const cachedProfile = getCachedUserProfile();
    if (cachedProfile) {
      setUserProfile(cachedProfile);
    }
  }, []);

  const fetchUserProfile = async (uid: string, useCache: boolean = true): Promise<UserProfile | null> => {
    try {
      setProfileLoading(true);
      
      // Try cache first if enabled
      if (useCache && !isInitialized) {
        const cachedProfile = getCachedUserProfile();
        if (cachedProfile && cachedProfile.uid === uid) {
          setUserProfile(cachedProfile);
          // Still fetch fresh data in background
          setTimeout(() => fetchUserProfile(uid, false), 100);
          setProfileLoading(false);
          return cachedProfile;
        }
      }

      const profile = await getDocument(COLLECTIONS.USERS, uid);
      if (profile) {
        setUserProfile(profile);
        setCachedUserProfile(profile); // Cache the profile
        setProfileLoading(false);
        return profile;
      }
      console.log("No such user profile document!");
      setUserProfile(null);
      setCachedUserProfile(null);
      setProfileLoading(false);
      return null;
    } catch (error) {
      console.error("Error fetching user profile:", error);
      setUserProfile(null);
      setProfileLoading(false);
      throw error; // Re-throw for handling upstream if needed
    }
  };

  async function signup(email: string, password: string, firstName: string, lastName: string): Promise<User | null> {
    console.log('AuthContext: Attempting signup with email:', email);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const authUser = userCredential.user;
      console.log('AuthContext: Firebase Auth Signup successful for:', email, authUser);

      if (authUser) {
        // Cache auth data immediately
        setCachedUserAuth(authUser);

        // Create full name
        const fullName = `${firstName.trim()} ${lastName.trim()}`;

        // Prepare UserProfile data
        const newUserProfileData: Omit<UserProfile, 'id' | 'createdAt' | 'updatedAt'> = {
          uid: authUser.uid, // uid from authUser matches the UserProfile interface's uid field
          email: authUser.email,
          displayName: authUser.displayName || fullName,
          fullName: fullName, // Store the full name
          photoURL: authUser.photoURL,
          // Initialize other fields as needed
          preferences: { theme: 'system', notifications: { email: true, inApp: true } },
          subscriptionStatus: 'free',
          credits: 10, // Example: give some initial credits
          // lastLogin will be set by setDocument if it's a new document
        };
        
        // setDocument will handle createdAt and updatedAt for new documents
        await setDocument(COLLECTIONS.USERS, authUser.uid, newUserProfileData);
        console.log('AuthContext: Firestore user profile created for:', authUser.uid);
        await fetchUserProfile(authUser.uid, false); // Don't use cache for fresh signup
        return authUser;
      }
      return null;
    } catch (error) {
      console.error('AuthContext: Signup failed for:', email, 'Error:', error);
      throw error; // Re-throw the error to be caught by the form
    }
  }

  async function login(email: string, password: string): Promise<User | null> {
    console.log('AuthContext: Attempting login with email:', email);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const authUser = userCredential.user;
      console.log('AuthContext: Login successful for:', email, authUser);
      if (authUser) {
        // Cache auth data immediately
        setCachedUserAuth(authUser);

        // First, try to fetch the user profile to see if it exists
        const existingProfile = await fetchUserProfile(authUser.uid);
        
        if (existingProfile) {
          // Profile exists, update lastLogin timestamp
          try {
            await updateDocument(COLLECTIONS.USERS, authUser.uid, { lastLogin: Timestamp.now() });
          } catch (updateError) {
            console.warn('AuthContext: Failed to update lastLogin, but continuing with login:', updateError);
          }
        } else {
          // Profile doesn't exist, create it
          console.log('AuthContext: User profile not found, creating new profile for existing auth user:', authUser.uid);
          const newUserProfileData: Omit<UserProfile, 'id' | 'createdAt' | 'updatedAt'> = {
            uid: authUser.uid,
            email: authUser.email,
            displayName: authUser.displayName,
            photoURL: authUser.photoURL,
            preferences: { theme: 'system', notifications: { email: true, inApp: true } },
            subscriptionStatus: 'free',
            credits: 10,
            lastLogin: Timestamp.now(),
          };
          
          try {
            await setDocument(COLLECTIONS.USERS, authUser.uid, newUserProfileData);
            console.log('AuthContext: Created missing user profile for:', authUser.uid);
            await fetchUserProfile(authUser.uid, false); // Fetch the newly created profile
          } catch (createError) {
            console.error('AuthContext: Failed to create user profile during login:', createError);
            // Continue with login even if profile creation fails
          }
        }
        
        return authUser;
      }
      return null;
    } catch (error) {
      console.error('AuthContext: Login failed for:', email, 'Error:', error);
      throw error;
    }
  }

  function logout() {
    console.log('AuthContext: Attempting logout for current user:', currentUser?.email);
    setUserProfile(null); // Clear profile on logout
    setCachedUserProfile(null); // Clear cached profile
    setCachedUserAuth(null); // Clear cached auth
    return signOut(auth);
  }

  function doSendPasswordResetEmail(email: string) {
    console.log('AuthContext: Attempting to send password reset for email:', email);
    return firebaseSendPasswordResetEmail(auth, email)
      .then(() => {
        console.log('AuthContext: Password reset email sent successfully to:', email);
      })
      .catch((error) => {
        console.error('AuthContext: Password reset email failed for:', email, 'Error:', error);
        throw error;
      });
  }

  useEffect(() => {
    setLoading(true);
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      if (user) {
        // Cache the auth user immediately
        setCachedUserAuth(user);
        // Fetch profile with cache enabled for faster loading
        await fetchUserProfile(user.uid, true);
      } else {
        setUserProfile(null);
        setCachedUserProfile(null);
        setCachedUserAuth(null);
      }
      
      setLoading(false);
      setIsInitialized(true);
    });

    return unsubscribe; // Cleanup subscription on unmount
  }, []);

  const value = {
    currentUser,
    userProfile,
    loading,
    profileLoading,
    signup,
    login,
    logout,
    sendPasswordResetEmail: doSendPasswordResetEmail,
    fetchUserProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {/* Render children only after initial loading is complete to prevent flicker */}
      {/* Or show a global loader based on loading state */}
      {children} 
    </AuthContext.Provider>
  );
} 