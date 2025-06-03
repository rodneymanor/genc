"use client";

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  User, 
  Check, 
  Loader2, 
  Edit, 
  Users, 
  Sparkles,
  ExternalLink,
  Instagram,
  Youtube,
  Facebook,
  Music
} from "lucide-react";

const OnboardingModal = ({ isOpen, onClose, onComplete }) => {
  const [step, setStep] = useState('profile'); // 'profile' or 'voice'
  const [profileUrl, setProfileUrl] = useState('');
  const [isCheckingProfile, setIsCheckingProfile] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [selectedVoiceOption, setSelectedVoiceOption] = useState(null);

  // Platform detection helper
  const detectPlatform = (url) => {
    if (url.includes('instagram.com')) return 'instagram';
    if (url.includes('tiktok.com')) return 'tiktok';
    if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube';
    if (url.includes('facebook.com')) return 'facebook';
    return 'unknown';
  };

  // Get platform icon
  const getPlatformIcon = (platform) => {
    const iconProps = { className: "w-4 h-4" };
    switch (platform) {
      case 'instagram': return <Instagram {...iconProps} />;
      case 'youtube': return <Youtube {...iconProps} />;
      case 'facebook': return <Facebook {...iconProps} />;
      case 'tiktok': return <Music {...iconProps} />;
      default: return <ExternalLink {...iconProps} />;
    }
  };

  // Handle profile check
  const handleCheckProfile = async () => {
    if (!profileUrl.trim()) return;

    setIsCheckingProfile(true);
    
    try {
      console.log('Fetching profile data for:', profileUrl);
      const response = await fetch('/api/fetch-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ profileUrl }),
      });
      
      const data = await response.json();
      console.log('Profile API response:', data);
      
      if (response.ok && data.success && data.profileData) {
        console.log('Successfully fetched profile data:', data.profileData);
        setProfileData(data.profileData);
        
        // Add a small delay to ensure the profile data is set before transitioning
        setTimeout(() => {
          setStep('voice');
        }, 100);
        
        if (data.warning) {
          console.warn('API Warning:', data.warning);
        }
      } else {
        console.error('Profile API failed:', data.error || 'Unknown error');
        
        // Create fallback profile data but with better error messaging
        const fallbackProfileData = {
          platform: detectPlatform(profileUrl),
          username: '@profile_user',
          displayName: 'Profile User',
          profileImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face&auto=format&q=80',
          followers: 'N/A',
          following: 'N/A',
          posts: 'N/A',
          bio: 'Profile information could not be loaded. Using demo data for voice setup.',
          verified: false,
          profileUrl: profileUrl
        };
        
        console.log('Using fallback profile data:', fallbackProfileData);
        setProfileData(fallbackProfileData);
        
        // Still proceed to voice step with fallback data
        setTimeout(() => {
          setStep('voice');
        }, 100);
      }
    } catch (error) {
      console.error('Network error fetching profile:', error);
      
      // Create fallback profile data for network errors
      const fallbackProfileData = {
        platform: detectPlatform(profileUrl),
        username: '@demo_user',
        displayName: 'Demo User',
        profileImage: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&h=400&fit=crop&crop=face&auto=format&q=80',
        followers: '12.3K',
        following: '892',
        posts: '156',
        bio: 'Demo profile for voice setup. Network error occurred while fetching real data.',
        verified: false,
        profileUrl: profileUrl
      };
      
      console.log('Using network error fallback data:', fallbackProfileData);
      setProfileData(fallbackProfileData);
      
      // Still proceed to voice step
      setTimeout(() => {
        setStep('voice');
      }, 100);
    } finally {
      setIsCheckingProfile(false);
    }
  };

  // Voice creation options
  const voiceOptions = [
    {
      id: 'scratch',
      title: 'From Scratch',
      description: 'Create a unique voice by providing example posts manually.',
      icon: Edit,
      color: 'bg-blue-50 border-blue-200 hover:bg-blue-100',
      iconColor: 'text-blue-600',
      action: 'Add posts'
    },
    {
      id: 'clone',
      title: 'Clone a Creator',
      description: "Instantly clone any creator's writing style from their profile.",
      icon: Users,
      color: 'bg-purple-50 border-purple-200 hover:bg-purple-100',
      iconColor: 'text-purple-600',
      action: 'Choose creator'
    },
    {
      id: 'mystyle',
      title: 'Use My Style',
      description: 'Create an AI voice that matches your own writing style.',
      icon: Sparkles,
      color: 'bg-pink-50 border-pink-200 hover:bg-pink-100',
      iconColor: 'text-pink-600',
      action: 'Analyze my posts',
      highlighted: true
    }
  ];

  const handleVoiceOptionSelect = (optionId) => {
    setSelectedVoiceOption(optionId);
    
    // Handle different voice creation flows
    switch (optionId) {
      case 'scratch':
        // Navigate to manual post creation
        console.log('Navigate to manual post creation');
        break;
      case 'clone':
        // Navigate to creator selection
        console.log('Navigate to creator selection');
        break;
      case 'mystyle':
        // Start analyzing user's posts
        console.log('Start analyzing user posts');
        break;
    }
    
    // Close modal and complete onboarding
    onComplete?.(optionId, profileData);
  };

  const handleSkip = () => {
    onComplete?.('skip', null);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            {step === 'profile' ? 'Connect Your Profile' : 'Create Your AI Voice'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {step === 'profile' && (
            <>
              {/* Profile URL Input Section */}
              <div className="space-y-4">
                <div className="text-center">
                  <p className="text-muted-foreground">
                    Enter your social media profile URL to get started
                  </p>
                </div>
                
                <div className="flex gap-2">
                  <Input
                    placeholder="https://instagram.com/yourusername"
                    value={profileUrl}
                    onChange={(e) => setProfileUrl(e.target.value)}
                    className="flex-1"
                    disabled={isCheckingProfile}
                  />
                  <Button 
                    onClick={handleCheckProfile}
                    disabled={!profileUrl.trim() || isCheckingProfile}
                    className="px-6"
                  >
                    {isCheckingProfile ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Check className="w-4 h-4" />
                    )}
                    {isCheckingProfile ? 'Checking...' : 'Check'}
                  </Button>
                </div>
                
                <div className="text-center">
                  <Button variant="link" onClick={handleSkip} className="text-sm">
                    Skip for now
                  </Button>
                </div>
              </div>

              {/* Profile Data Display */}
              {profileData && (
                <Card className="border-primary/20">
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-4">
                      <Avatar className="w-16 h-16">
                        <AvatarImage src={profileData.profileImage} alt={profileData.displayName} />
                        <AvatarFallback>
                          <User className="w-8 h-8" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-lg">{profileData.displayName}</h3>
                          {profileData.verified && (
                            <Check className="w-4 h-4 text-blue-500" />
                          )}
                          <Badge variant="outline" className="ml-auto">
                            {getPlatformIcon(profileData.platform)}
                            <span className="ml-1 capitalize">{profileData.platform}</span>
                          </Badge>
                        </div>
                        <p className="text-muted-foreground text-sm">{profileData.username}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-sm text-muted-foreground mb-4">{profileData.bio}</p>
                    <div className="flex justify-between text-center">
                      <div>
                        <div className="font-semibold">{profileData.posts}</div>
                        <div className="text-xs text-muted-foreground">Posts</div>
                      </div>
                      <div>
                        <div className="font-semibold">{profileData.followers}</div>
                        <div className="text-xs text-muted-foreground">Followers</div>
                      </div>
                      <div>
                        <div className="font-semibold">{profileData.following}</div>
                        <div className="text-xs text-muted-foreground">Following</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}

          {step === 'voice' && profileData && (
            <>
              {/* Profile Summary */}
              <Card className="bg-muted/30">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-12 h-12">
                      <AvatarImage 
                        src={profileData.profileImage} 
                        alt={profileData.displayName}
                        onError={(e) => {
                          console.error('Profile image failed to load:', profileData.profileImage);
                          e.target.style.display = 'none';
                        }}
                        onLoad={() => {
                          console.log('Profile image loaded successfully:', profileData.profileImage);
                        }}
                      />
                      <AvatarFallback>
                        <User className="w-6 h-6" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{profileData.displayName}</p>
                        {profileData.verified && (
                          <Check className="w-4 h-4 text-blue-500" />
                        )}
                        <Badge variant="outline" className="ml-auto">
                          {getPlatformIcon(profileData.platform)}
                          <span className="ml-1 capitalize">{profileData.platform}</span>
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{profileData.username}</p>
                      {profileData.bio && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {profileData.bio.length > 80 ? `${profileData.bio.substring(0, 80)}...` : profileData.bio}
                        </p>
                      )}
                    </div>
                    <Button variant="outline" size="sm" onClick={() => setStep('profile')}>
                      Change
                    </Button>
                  </div>

                  {/* Stats Row */}
                  {(profileData.posts || profileData.followers || profileData.following) && (
                    <div className="flex justify-center gap-6 text-center mt-3 pt-3 border-t">
                      {profileData.posts && (
                        <div>
                          <div className="font-semibold text-sm">{profileData.posts}</div>
                          <div className="text-xs text-muted-foreground">Posts</div>
                        </div>
                      )}
                      {profileData.followers && (
                        <div>
                          <div className="font-semibold text-sm">{profileData.followers}</div>
                          <div className="text-xs text-muted-foreground">Followers</div>
                        </div>
                      )}
                      {profileData.following && (
                        <div>
                          <div className="font-semibold text-sm">{profileData.following}</div>
                          <div className="text-xs text-muted-foreground">Following</div>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Separator />

              {/* Voice Creation Options */}
              <div>
                <h3 className="text-lg font-semibold mb-4 text-center">Your Custom Voice</h3>
                <p className="text-sm text-muted-foreground text-center mb-6">
                  Choose how you&apos;d like to create your AI voice
                </p>
                
                <div className="grid gap-4">
                  {voiceOptions.map((option) => {
                    const IconComponent = option.icon;
                    return (
                      <Card 
                        key={option.id}
                        className={`cursor-pointer transition-all duration-200 ${option.color} ${
                          option.highlighted ? 'ring-2 ring-primary/20' : ''
                        }`}
                        onClick={() => handleVoiceOptionSelect(option.id)}
                      >
                        <CardContent className="p-6">
                          <div className="flex items-start gap-4">
                            <div className={`p-3 rounded-full bg-white ${option.iconColor}`}>
                              <IconComponent className="w-6 h-6" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-lg mb-2">{option.title}</h4>
                              <p className="text-muted-foreground text-sm mb-4">{option.description}</p>
                              <Button 
                                variant={option.highlighted ? "default" : "outline"}
                                size="sm"
                                className="w-full"
                              >
                                {option.action} →
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>

              <div className="text-center pt-4">
                <Button variant="link" onClick={handleSkip} className="text-sm">
                  Skip for now
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OnboardingModal; 