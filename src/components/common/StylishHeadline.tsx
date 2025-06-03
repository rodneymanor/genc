import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Instagram, Youtube, Facebook, Music, User } from "lucide-react";

interface UserProfileData {
  platform: string;
  username: string;
  displayName: string;
  profileImage: string;
  verified?: boolean;
  bio?: string;
}

interface StylishHeadlineProps {
  firstName?: string | null;
  userProfileData?: UserProfileData | null; // Add profile data prop
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

export default function StylishHeadline({ firstName, userProfileData }: StylishHeadlineProps) {
  const welcomeName = firstName || 'Creator';

  return (
    <div className="w-full pb-4 flex flex-col items-center justify-center space-y-4">
      {/* User Profile Section - Show if profile data is available */}
      {userProfileData && (
        <div className="flex items-center gap-3 mb-2">
          <Avatar className="w-12 h-12">
            <AvatarImage src={userProfileData.profileImage} alt={userProfileData.displayName} />
            <AvatarFallback>
              <User className="w-6 h-6" />
            </AvatarFallback>
          </Avatar>
          <div className="text-left">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-foreground">{userProfileData.displayName}</span>
              {userProfileData.verified && (
                <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                  <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
              <Badge variant="outline" className="text-xs px-2 py-0">
                {getPlatformIcon(userProfileData.platform)}
                <span className="ml-1 capitalize">{userProfileData.platform}</span>
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">{userProfileData.username}</p>
          </div>
        </div>
      )}
      
      {/* Main Headline */}
      <div className="text-[36px] font-bold text-center text-[hsl(var(--muted-foreground))] leading-tight">
        {userProfileData ? `Welcome back, ${userProfileData.displayName}!` : 'What will you script today?'}
      </div>
      
      {/* Subtitle with bio if available */}
      {userProfileData?.bio && (
        <p className="text-sm text-muted-foreground text-center max-w-md">
          {userProfileData.bio.length > 100 ? `${userProfileData.bio.substring(0, 100)}...` : userProfileData.bio}
        </p>
      )}
    </div>
  );
} 