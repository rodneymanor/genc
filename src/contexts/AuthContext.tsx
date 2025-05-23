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
  signup: (email: string, password: string, firstName?: string, lastName?: string) => Promise<User | null>; // Adjusted to potentially pass more data and return User
  login: (email: string, password: string) => Promise<User | null>; // Return User
  logout: () => Promise<void>;
  sendPasswordResetEmail: (email: string) => Promise<void>;
  fetchUserProfile: (uid: string) => Promise<UserProfile | null>; // Add a function to explicitly fetch profile
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

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

  const fetchUserProfile = async (uid: string): Promise<UserProfile | null> => {
    try {
      const profile = await getDocument(COLLECTIONS.USERS, uid);
      if (profile) {
        setUserProfile(profile);
        return profile;
      }
      console.log("No such user profile document!");
      setUserProfile(null);
      return null;
    } catch (error) {
      console.error("Error fetching user profile:", error);
      setUserProfile(null);
      throw error; // Re-throw for handling upstream if needed
    }
  };

  async function signup(email: string, password: string, firstName?: string, lastName?: string): Promise<User | null> {
    console.log('AuthContext: Attempting signup with email:', email);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const authUser = userCredential.user;
      console.log('AuthContext: Firebase Auth Signup successful for:', email, authUser);

      if (authUser) {
        // Prepare UserProfile data
        const newUserProfileData: Omit<UserProfile, 'id' | 'createdAt' | 'updatedAt'> = {
          uid: authUser.uid, // uid from authUser matches the UserProfile interface's uid field
          email: authUser.email,
          displayName: authUser.displayName || (firstName && lastName ? `${firstName} ${lastName}` : null),
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
        await fetchUserProfile(authUser.uid);
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
        // Update lastLogin timestamp using updateDocument
        await updateDocument(COLLECTIONS.USERS, authUser.uid, { lastLogin: Timestamp.now() });
        await fetchUserProfile(authUser.uid); // Fetch profile on login
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
        await fetchUserProfile(user.uid);
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return unsubscribe; // Cleanup subscription on unmount
  }, []);

  const value = {
    currentUser,
    userProfile,
    loading,
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