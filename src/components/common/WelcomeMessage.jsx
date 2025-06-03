'use client';

import { useContext } from 'react';
import Link from 'next/link';
import { AuthContext } from '@/contexts/AuthContext';
import { capitalizeUserName } from '@/lib/utils';

const WelcomeMessage = () => {
  const { userProfile, loading: authLoading } = useContext(AuthContext);

  // Show loading state while auth is resolving
  if (authLoading) {
    return null;
  }

  // If no user is logged in, show login prompt
  if (!userProfile) {
    return (
      <div className="text-center">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-2">
          👋🏼 Hi there, log in below to start using the app
        </h1>
        <Link 
          href="/login" 
          className="text-lg text-blue-600 hover:text-blue-800 underline transition-colors"
        >
          Log in here
        </Link>
      </div>
    );
  }

  const getUserDisplayName = () => {
    if (userProfile?.displayName) {
      return capitalizeUserName(userProfile.displayName);
    }
    if (userProfile?.email) {
      return capitalizeUserName(userProfile.email.split('@')[0]);
    }
    return 'User';
  };

  return (
    <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">
      Welcome back, {getUserDisplayName()}
    </h1>
  );
};

export default WelcomeMessage; 