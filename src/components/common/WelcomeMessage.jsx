'use client';

import { useContext } from 'react';
import Link from 'next/link';
import { AuthContext } from '@/contexts/AuthContext';
import { capitalizeUserName } from '@/lib/utils';

const WelcomeMessage = () => {
  const { userProfile, loading: authLoading, profileLoading } = useContext(AuthContext);

  const getUserDisplayName = () => {
    if (userProfile?.fullName) {
      // Extract first name from full name
      const firstName = userProfile.fullName.trim().split(' ')[0];
      return capitalizeUserName(firstName);
    }
    if (userProfile?.displayName) {
      // Extract first name from display name if it contains spaces
      const firstName = userProfile.displayName.trim().split(' ')[0];
      return capitalizeUserName(firstName);
    }
    if (userProfile?.email) {
      return capitalizeUserName(userProfile.email.split('@')[0]);
    }
    return 'User';
  };

  // Show loading skeleton while auth is resolving or profile is loading
  if (authLoading || (!userProfile && profileLoading)) {
    return (
      <div className="text-center animate-pulse">
        <div className="h-12 md:h-16 bg-muted/30 rounded-lg w-96 max-w-full mx-auto mb-2"></div>
        <div className="h-6 bg-muted/20 rounded w-48 mx-auto"></div>
      </div>
    );
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

  return (
    <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">
      Welcome back, {getUserDisplayName()}
    </h1>
  );
};

export default WelcomeMessage; 