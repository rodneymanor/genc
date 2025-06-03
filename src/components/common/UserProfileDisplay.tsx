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
  followers?: string;
  following?: string;
  posts?: string;
}

interface UserProfileDisplayProps {
  profileData: UserProfileData;
  size?: 'sm' | 'md' | 'lg';
  showBio?: boolean;
  showStats?: boolean;
  className?: string;
}

// Get platform icon
const getPlatformIcon = (platform: string, size: string = 'sm') => {
  const sizeMap = {
    sm: "w-3 h-3",
    md: "w-4 h-4", 
    lg: "w-5 h-5"
  };
  const iconProps = { className: sizeMap[size as keyof typeof sizeMap] || sizeMap.sm };
  
  switch (platform) {
    case 'instagram': return <Instagram {...iconProps} />;
    case 'youtube': return <Youtube {...iconProps} />;
    case 'facebook': return <Facebook {...iconProps} />;
    case 'tiktok': return <Music {...iconProps} />;
    default: return null;
  }
};

export const UserProfileDisplay: React.FC<UserProfileDisplayProps> = ({
  profileData,
  size = 'md',
  showBio = false,
  showStats = false,
  className = ''
}) => {
  const sizeClasses = {
    sm: {
      avatar: "w-8 h-8",
      name: "text-sm font-medium",
      username: "text-xs text-muted-foreground",
      bio: "text-xs text-muted-foreground",
      badge: "text-xs px-1 py-0"
    },
    md: {
      avatar: "w-12 h-12",
      name: "text-base font-semibold",
      username: "text-sm text-muted-foreground",
      bio: "text-sm text-muted-foreground",
      badge: "text-xs px-2 py-0"
    },
    lg: {
      avatar: "w-16 h-16",
      name: "text-lg font-bold",
      username: "text-base text-muted-foreground",
      bio: "text-base text-muted-foreground",
      badge: "text-sm px-3 py-1"
    }
  };

  const classes = sizeClasses[size];

  return (
    <div className={`flex flex-col items-center space-y-3 ${className}`}>
      {/* Profile Header */}
      <div className="flex items-center gap-3">
        <Avatar className={classes.avatar}>
          <AvatarImage src={profileData.profileImage} alt={profileData.displayName} />
          <AvatarFallback>
            <User className={size === 'sm' ? 'w-4 h-4' : size === 'md' ? 'w-6 h-6' : 'w-8 h-8'} />
          </AvatarFallback>
        </Avatar>
        <div className="text-left">
          <div className="flex items-center gap-2">
            <span className={classes.name}>{profileData.displayName}</span>
            {profileData.verified && (
              <div className={`bg-blue-500 rounded-full flex items-center justify-center ${
                size === 'sm' ? 'w-3 h-3' : size === 'md' ? 'w-4 h-4' : 'w-5 h-5'
              }`}>
                <svg 
                  className={`text-white ${
                    size === 'sm' ? 'w-2 h-2' : size === 'md' ? 'w-2.5 h-2.5' : 'w-3 h-3'
                  }`} 
                  fill="currentColor" 
                  viewBox="0 0 20 20"
                >
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            )}
            <Badge variant="outline" className={classes.badge}>
              {getPlatformIcon(profileData.platform, size)}
              <span className="ml-1 capitalize">{profileData.platform}</span>
            </Badge>
          </div>
          <p className={classes.username}>{profileData.username}</p>
        </div>
      </div>

      {/* Bio */}
      {showBio && profileData.bio && (
        <p className={`${classes.bio} text-center max-w-md`}>
          {profileData.bio.length > 150 ? `${profileData.bio.substring(0, 150)}...` : profileData.bio}
        </p>
      )}

      {/* Stats */}
      {showStats && (profileData.posts || profileData.followers || profileData.following) && (
        <div className="flex justify-center gap-6 text-center">
          {profileData.posts && (
            <div>
              <div className={`font-semibold ${size === 'sm' ? 'text-sm' : size === 'md' ? 'text-base' : 'text-lg'}`}>
                {profileData.posts}
              </div>
              <div className={`text-muted-foreground ${size === 'sm' ? 'text-xs' : 'text-sm'}`}>
                Posts
              </div>
            </div>
          )}
          {profileData.followers && (
            <div>
              <div className={`font-semibold ${size === 'sm' ? 'text-sm' : size === 'md' ? 'text-base' : 'text-lg'}`}>
                {profileData.followers}
              </div>
              <div className={`text-muted-foreground ${size === 'sm' ? 'text-xs' : 'text-sm'}`}>
                Followers
              </div>
            </div>
          )}
          {profileData.following && (
            <div>
              <div className={`font-semibold ${size === 'sm' ? 'text-sm' : size === 'md' ? 'text-base' : 'text-lg'}`}>
                {profileData.following}
              </div>
              <div className={`text-muted-foreground ${size === 'sm' ? 'text-xs' : 'text-sm'}`}>
                Following
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}; 