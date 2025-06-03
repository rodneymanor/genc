"use client";

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import OnboardingModal from "@/components/features/OnboardingModal";
import { Sparkles, RefreshCw, Eye } from "lucide-react";

export default function DemoVoiceSetup() {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingResult, setOnboardingResult] = useState(null);
  const [localStorageStatus, setLocalStorageStatus] = useState('Loading...');
  const [storedProfileData, setStoredProfileData] = useState(null);
  const [consoleLogs, setConsoleLogs] = useState([]);

  // Override console.log to capture logs for display
  useEffect(() => {
    const originalLog = console.log;
    const originalError = console.error;
    const originalWarn = console.warn;

    console.log = (...args) => {
      setConsoleLogs(prev => [...prev.slice(-20), { type: 'log', message: args.join(' '), timestamp: new Date().toLocaleTimeString() }]);
      originalLog(...args);
    };

    console.error = (...args) => {
      setConsoleLogs(prev => [...prev.slice(-20), { type: 'error', message: args.join(' '), timestamp: new Date().toLocaleTimeString() }]);
      originalError(...args);
    };

    console.warn = (...args) => {
      setConsoleLogs(prev => [...prev.slice(-20), { type: 'warn', message: args.join(' '), timestamp: new Date().toLocaleTimeString() }]);
      originalWarn(...args);
    };

    return () => {
      console.log = originalLog;
      console.error = originalError;
      console.warn = originalWarn;
    };
  }, []);

  // Check localStorage status on client side only
  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem('hasSeenOnboarding');
    const profileData = localStorage.getItem('userProfileData');
    
    setLocalStorageStatus(hasSeenOnboarding ? 'Onboarding completed' : 'First time user');
    
    if (profileData) {
      try {
        const parsedProfileData = JSON.parse(profileData);
        setStoredProfileData(parsedProfileData);
      } catch (error) {
        console.error('Error parsing stored profile data:', error);
      }
    }
  }, []);

  const handleOnboardingComplete = (voiceOption, profileData) => {
    console.log('Onboarding completed:', { voiceOption, profileData });
    setOnboardingResult({ voiceOption, profileData });
    setShowOnboarding(false);
    setLocalStorageStatus('Onboarding completed');
    
    // Store profile data if provided
    if (profileData) {
      localStorage.setItem('userProfileData', JSON.stringify(profileData));
      setStoredProfileData(profileData);
    }
  };

  const handleOnboardingClose = () => {
    console.log('Onboarding closed/skipped');
    setShowOnboarding(false);
  };

  const resetDemo = () => {
    setOnboardingResult(null);
    setStoredProfileData(null);
    setConsoleLogs([]);
    localStorage.removeItem('hasSeenOnboarding');
    localStorage.removeItem('userProfileData');
    setLocalStorageStatus('First time user');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/10 py-8 px-4 md:px-6">
      <div className="container mx-auto max-w-4xl space-y-8">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground flex items-center justify-center">
            <Sparkles className="w-10 h-10 mr-3 text-primary" />
            Voice Setup Demo
          </h1>
          <p className="text-lg text-muted-foreground mt-4">
            Test the onboarding modal and voice creation flow
          </p>
        </div>

        {/* Demo Controls */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Demo Controls
            </CardTitle>
            <CardDescription>
              Trigger the onboarding modal and see the results
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <Button 
                onClick={() => setShowOnboarding(true)}
                size="lg"
                className="flex-1"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Show Onboarding Modal
              </Button>
              <Button 
                onClick={resetDemo}
                variant="outline"
                size="lg"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Reset Demo
              </Button>
            </div>
            
            {/* Local Storage Status */}
            <div className="text-sm text-muted-foreground">
              <strong>Local Storage Status:</strong>{' '}
              {localStorageStatus}
            </div>
          </CardContent>
        </Card>

        {/* Results Display */}
        {onboardingResult && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Onboarding Result
                <Badge variant="outline" className="text-xs">
                  {onboardingResult.voiceOption}
                </Badge>
              </CardTitle>
              <CardDescription>
                Data returned from the onboarding flow
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-sm mb-2">Selected Voice Option:</h4>
                  <Badge variant="secondary" className="text-sm px-3 py-1">
                    {onboardingResult.voiceOption}
                  </Badge>
                </div>
                
                {onboardingResult.profileData && (
                  <div>
                    <h4 className="font-semibold text-sm mb-2">Profile Data:</h4>
                    <div className="bg-muted rounded-lg p-3">
                      <pre className="text-xs overflow-x-auto">
                        {JSON.stringify(onboardingResult.profileData, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}
                
                {!onboardingResult.profileData && (
                  <div>
                    <h4 className="font-semibold text-sm mb-2">Profile Data:</h4>
                    <p className="text-sm text-muted-foreground italic">
                      No profile data (user skipped or selected non-profile option)
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stored Profile Data Display */}
        {storedProfileData && (
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Stored Profile Data
                <Badge variant="outline" className="text-xs bg-green-50 text-green-700">
                  Persisted
                </Badge>
              </CardTitle>
              <CardDescription>
                Profile data currently stored in localStorage and displayed in the app
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Profile Preview */}
                <div>
                  <h4 className="font-semibold text-sm mb-3">How it appears in the app:</h4>
                  <div className="border rounded-lg p-4 bg-muted/20">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 rounded-full overflow-hidden bg-muted">
                        <img 
                          src={storedProfileData.profileImage} 
                          alt={storedProfileData.displayName}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="text-left">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-foreground">{storedProfileData.displayName}</span>
                          {storedProfileData.verified && (
                            <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                              <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </div>
                          )}
                          <Badge variant="outline" className="text-xs px-2 py-0">
                            <span className="capitalize">{storedProfileData.platform}</span>
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{storedProfileData.username}</p>
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-muted-foreground">
                        Welcome back, {storedProfileData.displayName}!
                      </div>
                      {storedProfileData.bio && (
                        <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">
                          {storedProfileData.bio.length > 100 ? `${storedProfileData.bio.substring(0, 100)}...` : storedProfileData.bio}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Raw stored data */}
                <div>
                  <h4 className="font-semibold text-sm mb-2">Raw stored data:</h4>
                  <div className="bg-muted rounded-lg p-3">
                    <pre className="text-xs overflow-x-auto">
                      {JSON.stringify(storedProfileData, null, 2)}
                    </pre>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Console Logs Display */}
        {consoleLogs.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Console Logs
                <Badge variant="outline" className="text-xs">
                  {consoleLogs.length} entries
                </Badge>
              </CardTitle>
              <CardDescription>
                Real-time debugging information from the onboarding flow
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-black rounded-lg p-3 max-h-60 overflow-y-auto">
                <div className="space-y-1 text-xs font-mono">
                  {consoleLogs.map((log, index) => (
                    <div key={index} className={`${
                      log.type === 'error' ? 'text-red-400' : 
                      log.type === 'warn' ? 'text-yellow-400' : 
                      'text-green-400'
                    }`}>
                      <span className="text-gray-500">[{log.timestamp}]</span> {log.message}
                    </div>
                  ))}
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setConsoleLogs([])}
                className="mt-3"
              >
                Clear Logs
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Feature Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Voice Setup Features</CardTitle>
            <CardDescription>
              Overview of the onboarding modal capabilities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">Social Media Integration</h4>
                <p className="text-xs text-muted-foreground">
                  Automatically fetches profile information from social media URLs including avatar, follower count, and bio.
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">Voice Creation Options</h4>
                <p className="text-xs text-muted-foreground">
                  Three distinct paths: From Scratch (manual), Clone a Creator, and Use My Style (automated analysis).
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">Reusable Component</h4>
                <p className="text-xs text-muted-foreground">
                  Built as a reusable component for integration across different pages and workflows.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Onboarding Modal */}
        <OnboardingModal
          isOpen={showOnboarding}
          onClose={handleOnboardingClose}
          onComplete={handleOnboardingComplete}
        />
      </div>
    </div>
  );
} 