"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, Instagram, Check, AlertCircle } from "lucide-react";

export default function TestInstagram() {
  const [profileUrl, setProfileUrl] = useState('https://instagram.com/rodneyai_');
  const [isLoading, setIsLoading] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [error, setError] = useState(null);

  const testInstagramAPI = async () => {
    if (!profileUrl.trim()) return;

    setIsLoading(true);
    setError(null);
    setProfileData(null);
    
    try {
      const response = await fetch('/api/fetch-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ profileUrl }),
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        setProfileData(data.profileData);
        if (data.warning) {
          setError(`Warning: ${data.warning}`);
        }
      } else {
        setError(data.error || 'Failed to fetch profile data');
      }
    } catch (error) {
      console.error('Error:', error);
      setError('Network error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/10 py-8 px-4 md:px-6">
      <div className="container mx-auto max-w-4xl space-y-8">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground flex items-center justify-center">
            <Instagram className="w-10 h-10 mr-3 text-primary" />
            Instagram API Test
          </h1>
          <p className="text-lg text-muted-foreground mt-4">
            Test the real Instagram profile fetching functionality
          </p>
        </div>

        {/* Test Controls */}
        <Card>
          <CardHeader>
            <CardTitle>Instagram Profile Tester</CardTitle>
            <CardDescription>
              Enter an Instagram profile URL to test the API integration
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="https://instagram.com/username"
                value={profileUrl}
                onChange={(e) => setProfileUrl(e.target.value)}
                className="flex-1"
                disabled={isLoading}
              />
              <Button 
                onClick={testInstagramAPI}
                disabled={!profileUrl.trim() || isLoading}
                className="px-6"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Instagram className="w-4 h-4" />
                )}
                {isLoading ? 'Testing...' : 'Test API'}
              </Button>
            </div>

            {/* Pre-filled test URLs */}
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setProfileUrl('https://instagram.com/rodneyai_')}
                disabled={isLoading}
              >
                Test: @rodneyai_
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setProfileUrl('https://instagram.com/instagram')}
                disabled={isLoading}
              >
                Test: @instagram
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setProfileUrl('https://instagram.com/cristiano')}
                disabled={isLoading}
              >
                Test: @cristiano
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Error Display */}
        {error && (
          <Card className="border-destructive/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-destructive">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">{error}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Profile Data Display */}
        {profileData && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Profile Data Retrieved
                <Badge variant="outline" className="text-xs">
                  {profileData.platform}
                </Badge>
              </CardTitle>
              <CardDescription>
                Data fetched from Instagram API
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Profile Summary */}
                <div className="flex items-center gap-4">
                  <Avatar className="w-16 h-16">
                    <AvatarImage src={profileData.profileImage} alt={profileData.displayName} />
                    <AvatarFallback>
                      <Instagram className="w-8 h-8" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-lg">{profileData.displayName}</h3>
                      {profileData.verified && (
                        <Check className="w-4 h-4 text-blue-500" />
                      )}
                    </div>
                    <p className="text-muted-foreground text-sm">{profileData.username}</p>
                    {profileData.category && (
                      <Badge variant="secondary" className="text-xs mt-1">
                        {profileData.category}
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Bio */}
                {profileData.bio && (
                  <div>
                    <h4 className="font-semibold text-sm mb-2">Bio:</h4>
                    <p className="text-sm text-muted-foreground">{profileData.bio}</p>
                  </div>
                )}

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 text-center">
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

                {/* Raw Data */}
                <div>
                  <h4 className="font-semibold text-sm mb-2">Raw API Response:</h4>
                  <div className="bg-muted rounded-lg p-3">
                    <pre className="text-xs overflow-x-auto">
                      {JSON.stringify(profileData, null, 2)}
                    </pre>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* API Information */}
        <Card>
          <CardHeader>
            <CardTitle>API Information</CardTitle>
            <CardDescription>
              Details about the Instagram API integration
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div>
                <strong>API Endpoint:</strong> instagram-scrapper-posts-reels-stories-downloader.p.rapidapi.com
              </div>
              <div>
                <strong>Supported Platforms:</strong> Instagram (real API), TikTok/YouTube/Facebook (mock data)
              </div>
              <div>
                <strong>Rate Limits:</strong> Check RapidAPI dashboard for current usage
              </div>
              <div>
                <strong>Fallback:</strong> If API fails, fallback mock data is provided
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 