'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Instagram, Youtube, Facebook, Music, User, Settings, LogOut } from "lucide-react";

// User profile interface
interface UserProfileData {
  photoURL?: string;
  displayName?: string;
  username?: string;
  platform?: string;
  verified?: boolean;
}

// Get platform icon
const getPlatformIcon = (platform: string) => {
  const iconProps = { className: "w-3 h-3" };
  switch (platform) {
    case 'instagram': return <Instagram {...iconProps} />;
    case 'youtube': return <Youtube {...iconProps} />;
    case 'facebook': return <Facebook {...iconProps} />;
    case 'tiktok': return <Music {...iconProps} />;
    default: return null;
  }
};

const AppHeader = () => {
  const [userProfileData, setUserProfileData] = useState<UserProfileData | null>(null);

  useEffect(() => {
    // Load profile data from localStorage
    const loadProfileData = () => {
      try {
        const storedProfileData = localStorage.getItem('userProfileData');
        if (storedProfileData) {
          const parsedProfileData = JSON.parse(storedProfileData);
          setUserProfileData(parsedProfileData);
        }
      } catch (error) {
        console.error('Error loading profile data in header:', error);
      }
    };

    loadProfileData();

    // Listen for profile data changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'userProfileData') {
        loadProfileData();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleSignOut = () => {
    localStorage.removeItem('userProfileData');
    localStorage.removeItem('hasSeenOnboarding');
    setUserProfileData(null);
    // Could also trigger a page refresh or navigation
    window.location.reload();
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <span className="font-poppins font-bold text-2xl">
            C
          </span>
        </Link>
        
        {/* Spacer to push profile to the right */}
        <div className="flex-1" />
        
        {/* User Profile Section */}
        {userProfileData ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={userProfileData?.photoURL || undefined} alt={userProfileData?.displayName || 'User'} />
                  <AvatarFallback>
                    <User className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium leading-none">{userProfileData?.displayName}</p>
                    {userProfileData?.verified && (
                      <div className="w-3 h-3 bg-blue-500 rounded-full flex items-center justify-center">
                        <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-xs leading-none text-muted-foreground">{userProfileData?.username}</p>
                    <Badge variant="outline" className="text-xs px-1 py-0">
                      {getPlatformIcon(userProfileData?.platform || '')}
                      <span className="ml-1 capitalize">{userProfileData?.platform}</span>
                    </Badge>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sign out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button variant="outline" size="sm" asChild>
            <Link href="/">Get Started</Link>
          </Button>
        )}
      </div>
    </header>
  );
};

export default AppHeader; 