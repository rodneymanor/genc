'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { auth, db } from '@/lib/firebase'; // Adjusted path
import {
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail
} from 'firebase/auth';
import { doc, getDoc, Timestamp } from 'firebase/firestore'; // Import getDoc and doc, Timestamp

// Define UserProfileData structure (matching what's in Firestore)
// This should align with UserProfileData in signup page, ensure consistency
interface UserProfileData {
  uid: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  createdAt?: Timestamp; // Assuming createdAt is stored as Firestore Timestamp
  // Add other fields if they exist in your Firestore 'users' documents
}

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfileData | null; // Add userProfile to type
  loading: boolean;
  signup: (email: string, password: string) => Promise<any>;
  login: (email: string, password: string) => Promise<any>;
  logout: () => Promise<void>;
  sendPasswordResetEmail: (email: string) => Promise<void>;
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
  const [userProfile, setUserProfile] = useState<UserProfileData | null>(null); // Add state for profile
  const [loading, setLoading] = useState(true);

  async function signup(email: string, password: string) {
    console.log('AuthContext: Attempting signup with email:', email);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      console.log('AuthContext: Signup successful for:', email, userCredential);
      return userCredential;
    } catch (error) {
      console.error('AuthContext: Signup failed for:', email, 'Error:', error);
      throw error; // Re-throw the error to be caught by the form
    }
  }

  async function login(email: string, password: string) {
    console.log('AuthContext: Attempting login with email:', email);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log('AuthContext: Login successful for:', email, userCredential);
      return userCredential;
    } catch (error) {
      console.error('AuthContext: Login failed for:', email, 'Error:', error);
      throw error;
    }
  }

  function logout() {
    console.log('AuthContext: Attempting logout for current user:', currentUser?.email);
    return signOut(auth);
  }

  function doSendPasswordResetEmail(email: string) {
    console.log('AuthContext: Attempting to send password reset for email:', email);
    return sendPasswordResetEmail(auth, email)
      .then(() => {
        console.log('AuthContext: Password reset email sent successfully to:', email);
      })
      .catch((error) => {
        console.error('AuthContext: Password reset email failed for:', email, 'Error:', error);
        throw error;
      });
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        // User is signed in, fetch their profile data
        const userDocRef = doc(db, "users", user.uid);
        try {
          const docSnap = await getDoc(userDocRef);
          if (docSnap.exists()) {
            setUserProfile({ uid: user.uid, ...docSnap.data() } as UserProfileData);
          } else {
            console.log("No such user profile document!");
            setUserProfile(null); // Or handle as an error/incomplete profile
          }
        } catch (error) {
          console.error("Error fetching user profile:", error);
          setUserProfile(null); // Handle error state
        }
      } else {
        // User is signed out
        setUserProfile(null);
      }
      setLoading(false);
    });

    return unsubscribe; // Cleanup subscription on unmount
  }, []);

  const value = {
    currentUser,
    userProfile, // Add userProfile to context value
    loading,
    signup,
    login,
    logout,
    sendPasswordResetEmail: doSendPasswordResetEmail
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
} 