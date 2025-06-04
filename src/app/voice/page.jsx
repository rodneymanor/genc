"use client";

import { useState, useContext, useEffect } from "react";
import { Mic, Play, Settings, Info, Crown, Zap, X, Edit, Users, User, ArrowLeft, CheckCircle, FileText, Trash2, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { AuthContext } from "@/contexts/AuthContext";
import { getUserVoiceProfiles, setActiveVoiceProfile, deleteVoiceProfile } from "@/lib/firestoreService";

// Platform Icons
const InstagramIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
  </svg>
);

const TikTokIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
  </svg>
);

// Voice Card Component
const VoiceCard = ({ voice, onActivate, onEdit, onDelete }) => {
  const formatDate = (date) => {
    // Handle both Firestore Timestamp and Date objects
    let dateObj;
    if (date && typeof date.toDate === 'function') {
      dateObj = date.toDate(); // Firestore Timestamp
    } else if (date instanceof Date) {
      dateObj = date;
    } else if (typeof date === 'string') {
      dateObj = new Date(date);
    } else {
      dateObj = new Date(); // Fallback
    }
    
    return dateObj.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const getPlatformColor = (platform) => {
    switch (platform) {
      case 'instagram': return 'bg-pink-100 text-pink-700 dark:bg-pink-900/20 dark:text-pink-400';
      case 'tiktok': return 'bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-400';
      case 'twitter': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400';
      case 'linkedin': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400';
      case 'threads': return 'bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-400';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          {/* Profile Image */}
          <div className="relative">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
              {voice.sourceProfile?.profileImage ? (
                <img 
                  src={voice.sourceProfile.profileImage} 
                  alt={voice.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <User className="h-6 w-6 text-gray-600" />
              )}
            </div>
            {/* Status Indicator */}
            <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-background ${
              voice.status === 'ready' ? 'bg-green-500' : 
              voice.status === 'training' ? 'bg-yellow-500' : 'bg-red-500'
            }`}></div>
          </div>

          {/* Voice Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="font-semibold text-foreground">{voice.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-sm font-medium ${
                    voice.status === 'ready' ? 'text-green-600 dark:text-green-400' :
                    voice.status === 'training' ? 'text-yellow-600 dark:text-yellow-400' :
                    'text-red-600 dark:text-red-400'
                  }`}>
                    {voice.status === 'ready' ? 'Ready' : 
                     voice.status === 'training' ? 'Training' : 'Error'}
                  </span>
                  <Badge className={`text-xs ${getPlatformColor(voice.platform)}`}>
                    {voice.platform === 'instagram' && (
                      <>
                        <InstagramIcon className="w-3 h-3 mr-1" />
                        Instagram
                      </>
                    )}
                    {voice.platform === 'tiktok' && (
                      <>
                        <TikTokIcon className="w-3 h-3 mr-1" />
                        TikTok
                      </>
                    )}
                    {voice.platform === 'twitter' && '🐦 Twitter'}
                    {voice.platform === 'linkedin' && '💼 LinkedIn'}
                    {voice.platform === 'threads' && '🧵 Threads'}
                  </Badge>
                </div>
              </div>
              
              {/* Action Icons */}
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit(voice.id)}
                  className="h-8 w-8 p-0 hover:bg-accent"
                >
                  <Edit className="h-4 w-4 text-muted-foreground" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(voice.id)}
                  className="h-8 w-8 p-0 hover:bg-accent hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4 text-muted-foreground" />
                </Button>
              </div>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-6 text-sm text-muted-foreground mb-4">
              <div className="flex items-center gap-1">
                <FileText className="h-4 w-4" />
                <span className="font-medium text-foreground">{voice.postsCreated || 0}</span>
                <span>posts created</span>
              </div>
              <div>
                <span>Created on {formatDate(voice.createdAt)}</span>
              </div>
            </div>

            {/* Activate Button */}
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onActivate(voice.id)}
              className="text-blue-600 border-blue-200 hover:bg-blue-50 dark:text-blue-400 dark:border-blue-800 dark:hover:bg-blue-950/20"
              disabled={voice.status !== 'ready'}
            >
              <Play className="mr-1 h-3 w-3" />
              Activate
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const VoicePage = () => {
  const [activeVoice, setActiveVoice] = useState(null);
  const [activeTab, setActiveTab] = useState("custom");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [modalStep, setModalStep] = useState("selection"); // "selection", "clone-creator", "processing", "profile-review"
  const [selectedPlatform, setSelectedPlatform] = useState("instagram");
  const [creatorInput, setCreatorInput] = useState("");
  const [voices, setVoices] = useState([]); // Store created voices
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState(0);
  const [analysisResults, setAnalysisResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const { userProfile } = useContext(AuthContext);

  // Load voice profiles from database on component mount
  useEffect(() => {
    const loadVoiceProfiles = async () => {
      if (!userProfile?.uid) {
        setLoading(false);
        return;
      }

      try {
        console.log('Loading voice profiles for user:', userProfile.uid);
        const voiceProfiles = await getUserVoiceProfiles(userProfile.uid);
        console.log('Loaded voice profiles:', voiceProfiles);
        
        setVoices(voiceProfiles);
        
        // Set active voice if one exists
        const activeProfile = voiceProfiles.find(profile => profile.isActive);
        if (activeProfile) {
          setActiveVoice(activeProfile.id);
        }
      } catch (error) {
        console.error('Error loading voice profiles:', error);
      } finally {
        setLoading(false);
      }
    };

    loadVoiceProfiles();
  }, [userProfile?.uid]);

  // Processing steps for voice analysis
  const processingSteps = [
    { id: 1, title: "Fetching Videos", description: "Downloading 10 latest posts from profile", duration: 3000 },
    { id: 2, title: "Transcribing Audio", description: "Converting video audio to text", duration: 4000 },
    { id: 3, title: "Analyzing Scripts", description: "Applying Short-Form Video Script Analyst to each transcript", duration: 5000 },
    { id: 4, title: "Synthesizing Profile", description: "Creating comprehensive Voice DNA using Master Voice Profile Synthesizer", duration: 3000 }
  ];

  // Mock voice profile result for fallback
  const mockVoiceProfile = {
    voiceProfile: {
      coreIdentity: {
        suggestedPersonaName: "The Enthusiastic Tech Explainer",
        dominantTones: ["Enthusiastic", "Educational"],
        secondaryTones: ["Humorous (during anecdotes)", "Urgent (in CTAs)"],
        toneExemplars: ["Absolutely crucial!", "Here&apos;s the cool part:", "This is mind-blowing!"],
        uniqueIdentifiersOrQuirks: [
          "Always opens with a direct personal question to the viewer",
          "Uses 3-step actionable breakdowns for complex topics"
        ]
      },
      contentStrategyBlueprints: {
        commonHookStrategies: [
          {
            type: "Question",
            template: "Often starts with a direct, relatable question about common problems",
            examples: ["Are you tired of confusing tutorials?", "Ever wonder why your content isn&apos;t growing?"]
          },
          {
            type: "Bold Statement", 
            template: "Leads with surprising or counter-intuitive statements",
            examples: ["Most people get this completely wrong"]
          }
        ],
        dominantGoldenNuggetDelivery: {
          patterns: ["Uses 3-step actionable lists, often numbered", "Delivers insights via short personal anecdotes"],
          structuralTemplates: ["Step 1: [Action]. Step 2: [Action]. Step 3: [Action]."]
        }
      },
      actionableSystemPromptComponents: {
        voiceDnaSummaryDirectives: [
          "Prioritize an **enthusiastic and educational** primary tone",
          "Always begin scripts with a **question-based or bold statement hook**",
          "Structure content as **3 distinct, actionable tips or steps**",
          "Maintain a **fast conversational pace** using **short, declarative sentences**",
          "Address the audience directly as **'you'**",
          "Use vocabulary that is **energetic, positive, and accessible**"
        ]
      }
    }
  };

  // Mock data for voice limits
  const voiceUsage = {
    used: voices.length,
    total: 3,
    remaining: 3 - voices.length
  };

  const handleCreateVoice = () => {
    setShowCreateModal(true);
    setModalStep("selection");
  };

  const handleCloneCreator = () => {
    setModalStep("clone-creator");
  };

  const handleBackToMethods = () => {
    setModalStep("selection");
  };

  // Function to detect platform from URL
  const detectPlatformFromUrl = (url) => {
    if (!url) return null;
    
    try {
      const urlObj = new URL(url);
      const hostname = urlObj.hostname.toLowerCase();
      
      if (hostname.includes('instagram.com')) {
        return 'instagram';
      } else if (hostname.includes('tiktok.com')) {
        return 'tiktok';
      } else if (hostname.includes('twitter.com') || hostname.includes('x.com')) {
        return 'twitter';
      } else if (hostname.includes('linkedin.com')) {
        return 'linkedin';
      } else if (hostname.includes('threads.net')) {
        return 'threads';
      }
      
      return null;
    } catch (e) {
      return null;
    }
  };

  // Update creatorInput change handler to auto-detect platform
  const handleCreatorInputChange = (e) => {
    const value = e.target.value;
    setCreatorInput(value);
    
    // Auto-detect platform from URL
    const detectedPlatform = detectPlatformFromUrl(value);
    if (detectedPlatform && platforms.find(p => p.id === detectedPlatform)) {
      setSelectedPlatform(detectedPlatform);
    }
  };

  const handleCreateCloneVoice = async () => {
    if (!creatorInput.trim()) return;

    // Auto-detect platform from URL if not manually selected
    const detectedPlatform = detectPlatformFromUrl(creatorInput);
    const finalPlatform = detectedPlatform || selectedPlatform;

    setIsProcessing(true);
    setModalStep("processing");
    setProcessingStep(0);

    try {
      // Simulate the voice analysis process with real API calls
      for (let i = 0; i < processingSteps.length; i++) {
        setProcessingStep(i);
        
        // Add delay for UI feedback
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Call the real API on the last step
        if (i === processingSteps.length - 1) {
          console.log('Calling voice profile API...');
          
          const response = await fetch('/api/create-voice-profile', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              profileUrl: creatorInput,
              platform: finalPlatform,
              userId: userProfile?.uid
            })
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to create voice profile');
          }

          const data = await response.json();
          console.log('Voice profile created:', data);
          
          // Set the real analysis results
          setAnalysisResults(data);
        } else {
          // Continue with remaining steps
          await new Promise(resolve => setTimeout(resolve, processingSteps[i].duration - 1500));
        }
      }

      // Move to profile review with real data
      setModalStep("profile-review");
      setIsProcessing(false);
      
    } catch (error) {
      console.error('Error creating voice profile:', error);
      setIsProcessing(false);
      
      // Show error state or fallback to mock data
      setAnalysisResults(mockVoiceProfile);
      setModalStep("profile-review");
      
      // You could show an error message here instead
      alert('Error creating voice profile: ' + error.message);
    }
  };

  const handleConfirmVoiceCreation = async () => {
    if (!analysisResults || !userProfile?.uid) return;

    try {
      // Reload voice profiles from database to get the new one
      const updatedVoices = await getUserVoiceProfiles(userProfile.uid);
      setVoices(updatedVoices);
      
      closeModal();
    } catch (error) {
      console.error('Error refreshing voice profiles:', error);
      closeModal();
    }
  };

  const closeModal = () => {
    setShowCreateModal(false);
    setModalStep("selection");
    setCreatorInput("");
    setIsProcessing(false);
    setProcessingStep(0);
    setAnalysisResults(null);
  };

  const handleActivateVoice = async (voiceId) => {
    if (!userProfile?.uid) return;

    try {
      await setActiveVoiceProfile(userProfile.uid, voiceId);
      
      // Update local state
      setVoices(prev => prev.map(voice => ({
        ...voice,
        isActive: voice.id === voiceId
      })));
      setActiveVoice(voiceId);
    } catch (error) {
      console.error('Error activating voice:', error);
      alert('Failed to activate voice profile');
    }
  };

  const handleEditVoice = (voiceId) => {
    // TODO: Implement edit functionality
    console.log('Edit voice:', voiceId);
  };

  const handleDeleteVoice = async (voiceId) => {
    if (!userProfile?.uid) return;

    try {
      await deleteVoiceProfile(userProfile.uid, voiceId);
      
      // Remove from local state
      setVoices(prev => prev.filter(voice => voice.id !== voiceId));
      
      if (activeVoice === voiceId) {
        setActiveVoice(null);
      }
    } catch (error) {
      console.error('Error deleting voice:', error);
      alert('Failed to delete voice profile');
    }
  };

  const platforms = [
    { id: "instagram", name: "Instagram", icon: InstagramIcon },
    { id: "tiktok", name: "TikTok", icon: TikTokIcon }
  ];

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your voice profiles...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-background">
      {/* Header Section */}
      <div className="text-center py-12 px-4">
        <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
          AI Voice Studio
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
          Choose from our library of ready-made voices or create your own custom voice. Generate content that sounds exactly how you want it to.
        </p>
        
        {/* Tutorial Button - only show when no voice is active */}
        {!activeVoice && (
          <Button 
            variant="outline" 
            size="lg"
            className="rounded-full px-6 py-3"
          >
            <Play className="mr-2 h-4 w-4" />
            Watch a quick tutorial
          </Button>
        )}
      </div>

      {/* Active Voice Display */}
      <div className="max-w-4xl mx-auto px-4 mb-12">
        {activeVoice ? (
          /* Active Voice Card */
          <div className="text-center py-12">
            {/* Tutorial Button - moved to top */}
            <div className="mb-8">
              <Button 
                variant="outline" 
                size="lg"
                className="bg-black text-white hover:bg-black/90 rounded-full px-6 py-3"
              >
                <Play className="mr-2 h-4 w-4" />
                Watch a quick tutorial
              </Button>
            </div>

            <Card className="max-w-md mx-auto">
              <CardContent className="p-8">
                {/* Profile Image */}
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                  <User className="h-10 w-10 text-gray-600" />
                </div>

                {/* Voice Name */}
                <h2 className="text-2xl font-bold text-foreground mb-2">
                  {voices.find(v => v.id === activeVoice)?.name}
                </h2>

                {/* Subtitle */}
                <p className="text-muted-foreground mb-6">
                  Currently powering your content creation
                </p>

                {/* Platform Badge */}
                <div className="mb-8">
                  <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 px-3 py-1">
                    {voices.find(v => v.id === activeVoice)?.platform === 'instagram' && (
                      <>
                        <InstagramIcon className="w-4 h-4 mr-1" />
                        Optimized for Instagram
                      </>
                    )}
                    {voices.find(v => v.id === activeVoice)?.platform === 'tiktok' && (
                      <>
                        <TikTokIcon className="w-4 h-4 mr-1" />
                        Optimized for TikTok
                      </>
                    )}
                    {voices.find(v => v.id === activeVoice)?.platform === 'twitter' && '🐦 Optimized for Twitter'}
                    {voices.find(v => v.id === activeVoice)?.platform === 'linkedin' && '💼 Optimized for LinkedIn'}
                    {voices.find(v => v.id === activeVoice)?.platform === 'threads' && '🧵 Optimized for Threads'}
                  </Badge>
                </div>

                {/* Guidelines Section */}
                <div className="flex items-center justify-between mb-8 p-4 bg-accent rounded-lg">
                  <div className="flex items-center gap-2">
                    <Settings className="h-4 w-4 text-primary" />
                    <span className="font-medium text-primary">Guidelines</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="link" className="text-primary p-0 h-auto text-sm">
                      Show
                    </Button>
                    <div className="flex items-center">
                      <span className="text-sm text-muted-foreground mr-2">Off</span>
                      <div className="relative">
                        <input
                          type="checkbox"
                          className="sr-only"
                          id="guidelines-toggle"
                        />
                        <label
                          htmlFor="guidelines-toggle"
                          className="flex items-center cursor-pointer"
                        >
                          <div className="w-10 h-6 bg-muted rounded-full p-1 duration-300">
                            <div className="bg-background w-4 h-4 rounded-full shadow-sm duration-300"></div>
                          </div>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Deactivate Button */}
                <Button 
                  variant="destructive"
                  className="bg-red-600 hover:bg-red-700 text-white px-8"
                  onClick={() => {
                    setActiveVoice(null);
                    setVoices(prev => prev.map(voice => ({ ...voice, isActive: false })));
                  }}
                >
                  Deactivate
                </Button>
              </CardContent>
            </Card>
          </div>
        ) : (
          /* Default No Active Voice */
          <div className="text-center py-12">
            {/* Microphone Icon */}
            <div className="w-16 h-16 mx-auto mb-6 bg-primary rounded-2xl flex items-center justify-center">
              <Mic className="h-8 w-8 text-primary-foreground" />
            </div>
            
            <h2 className="text-2xl font-bold text-foreground mb-2">
              No Active Voice
            </h2>
            <p className="text-muted-foreground">
              Select a voice below to start creating content
            </p>
          </div>
        )}
      </div>

      {/* Tabs Section */}
      <div className="max-w-4xl mx-auto px-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="custom" className="text-base font-medium">
              My Custom Voices
            </TabsTrigger>
            <TabsTrigger value="library" className="text-base font-medium">
              Voice Library
            </TabsTrigger>
          </TabsList>

          {/* My Custom Voices Tab */}
          <TabsContent value="custom" className="space-y-6">
            {/* Voice Usage Card */}
            <Card className="bg-accent border-border">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Info className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        You have {voiceUsage.remaining} voices remaining until your plan renews on June 5, 2025
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Custom voices allow you to create tailored content that matches your unique style
                      </p>
                    </div>
                  </div>
                  <Button variant="link" className="text-primary text-sm font-medium">
                    Upgrade for more →
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Your Custom Voices Section */}
            <Card>
              <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-6">
                <div>
                  <CardTitle className="text-2xl font-bold">Your Custom Voices</CardTitle>
                  <CardDescription className="text-base">
                    Manage and customize your AI writing voices
                  </CardDescription>
                </div>
                <div className="flex flex-col items-end gap-4">
                  {/* Voice Limit Display */}
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <Mic className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Voice Limit</span>
                    </div>
                    <Badge variant="secondary" className="font-mono">
                      {voiceUsage.used} / {voiceUsage.total} used
                    </Badge>
                  </div>
                  
                  {/* Usage Progress */}
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">{voiceUsage.remaining} remaining</p>
                    <p className="text-xs text-muted-foreground">Resets Jun 6</p>
                  </div>

                  {/* Create AI Voice Button */}
                  <Button 
                    size="lg" 
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                    onClick={handleCreateVoice}
                    disabled={voiceUsage.remaining <= 0}
                  >
                    <Zap className="mr-2 h-4 w-4" />
                    Create AI Voice
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent>
                {/* Voices Display */}
                {voices.length === 0 ? (
                  /* Empty State */
                  <div className="text-center py-12">
                    <div className="w-16 h-16 mx-auto mb-6 bg-muted rounded-full flex items-center justify-center">
                      <Mic className="h-8 w-8 text-muted-foreground" />
                    </div>
                    
                    <h3 className="text-xl font-semibold mb-2">No custom voices yet</h3>
                    <p className="text-muted-foreground max-w-md mx-auto">
                      Create your first custom AI voice to personalize your social media content
                    </p>
                  </div>
                ) : (
                  /* Voice Cards */
                  <div className="space-y-4">
                    {voices.map((voice) => (
                      <VoiceCard
                        key={voice.id}
                        voice={voice}
                        onActivate={handleActivateVoice}
                        onEdit={handleEditVoice}
                        onDelete={handleDeleteVoice}
                      />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Voice Library Tab */}
          <TabsContent value="library" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl font-bold">Voice Library</CardTitle>
                <CardDescription className="text-base">
                  Choose from our collection of pre-made AI voices
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-6 bg-muted rounded-full flex items-center justify-center">
                    <Mic className="h-8 w-8 text-muted-foreground" />
                  </div>
                  
                  <h3 className="text-xl font-semibold mb-2">Voice Library Coming Soon</h3>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    We&apos;re preparing a collection of professional voices for you to choose from
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Create AI Voice Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-background rounded-lg shadow-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground p-8 relative">
              <button
                onClick={closeModal}
                className="absolute top-4 right-4 text-primary-foreground hover:text-primary-foreground/80 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
              <h2 className="text-3xl font-bold mb-4">Create Your AI Voice</h2>
              <p className="text-primary-foreground/90 text-lg">
                Train an AI to write in any style you want. Clone your favorite creators, use your own style, or create something entirely new.
              </p>
            </div>

            {/* Modal Content */}
            <div className="p-8">
              {modalStep === "selection" && (
                <div className="flex justify-center">
                  {/* Clone a Creator */}
                  <Card 
                    className="hover:shadow-md transition-shadow cursor-pointer border-2 hover:border-primary/20 max-w-sm w-full"
                    onClick={handleCloneCreator}
                  >
                    <CardContent className="p-6 text-center">
                      <div className="w-12 h-12 mx-auto mb-4 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center">
                        <Users className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                      </div>
                      <h3 className="text-xl font-semibold mb-3">Clone a Creator</h3>
                      <p className="text-muted-foreground mb-6 text-sm leading-relaxed">
                        Instantly clone any creator&apos;s writing style from their profile.
                      </p>
                      <Button variant="link" className="text-purple-600 dark:text-purple-400 p-0 h-auto font-medium">
                        Choose creator →
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              )}

              {modalStep === "clone-creator" && (
                <div className="space-y-8">
                  {/* Platform Selection */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Select platform</h3>
                    <div className="flex gap-3">
                      {platforms.map((platform) => {
                        const IconComponent = platform.icon;
                        const isSelected = selectedPlatform === platform.id;
                        const isAutoDetected = detectPlatformFromUrl(creatorInput) === platform.id;
                        return (
                          <Button
                            key={platform.id}
                            variant="outline"
                            onClick={() => setSelectedPlatform(platform.id)}
                            className={`px-4 py-2 border-2 transition-all relative ${
                              isSelected 
                                ? "bg-primary text-primary-foreground border-primary hover:bg-primary/90" 
                                : "border-border hover:bg-accent hover:text-accent-foreground"
                            }`}
                          >
                            <IconComponent className="w-4 h-4 mr-2" />
                            {platform.name}
                            {isAutoDetected && (
                              <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full"></span>
                            )}
                          </Button>
                        );
                      })}
                    </div>
                    {creatorInput && detectPlatformFromUrl(creatorInput) && (
                      <p className="text-sm text-green-600 dark:text-green-400 mt-2">
                        ✓ Platform auto-detected from URL
                      </p>
                    )}
                  </div>

                  {/* Creator Clone Tips */}
                  <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-6">
                    <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-4">Creator Clone Tips</h4>
                    <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
                      <li className="flex items-start gap-2">
                        <span className="text-blue-600 dark:text-blue-400 font-bold">•</span>
                        Enter a social media URL or username (we&apos;ll extract it for you)
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-600 dark:text-blue-400 font-bold">•</span>
                        Make sure the account is public and has at least 5 posts
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-600 dark:text-blue-400 font-bold">•</span>
                        We&apos;ll find the top 5 most popular posts to train your AI voice
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-600 dark:text-blue-400 font-bold">•</span>
                        Popular posts with more engagement create better AI voices
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-600 dark:text-blue-400 font-bold">•</span>
                        Content creators with consistent posting style work best
                      </li>
                    </ul>
                  </div>

                  {/* Username Input */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Enter creator&apos;s username or URL
                    </label>
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <Input
                          placeholder="@username or profile URL"
                          value={creatorInput}
                          onChange={handleCreatorInputChange}
                          className="w-full text-base py-3"
                        />
                        {creatorInput && !detectPlatformFromUrl(creatorInput) && creatorInput.includes('.') && (
                          <p className="text-sm text-amber-600 dark:text-amber-400">
                            ⚠️ Platform could not be auto-detected. Please ensure the URL is from a supported platform.
                          </p>
                        )}
                      </div>
                      
                      {/* Submit Button - Made much more prominent */}
                      <div className="flex justify-center">
                        <Button
                          className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-12 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200 rounded-lg"
                          disabled={!creatorInput.trim()}
                          onClick={handleCreateCloneVoice}
                          size="lg"
                        >
                          <CheckCircle className="mr-3 h-5 w-5" />
                          Create Voice Profile
                        </Button>
                      </div>
                      
                      {/* Helper text */}
                      {creatorInput.trim() && (
                        <div className="text-center">
                          <p className="text-sm text-green-600 dark:text-green-400 font-medium">
                            ✓ Ready to analyze profile
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between pt-6 border-t border-border">
                    <Button
                      variant="ghost"
                      onClick={handleBackToMethods}
                      className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Back to methods
                    </Button>
                    
                    <div className="text-sm text-muted-foreground">
                      {!creatorInput.trim() && "Enter a profile URL above to continue"}
                    </div>
                  </div>
                </div>
              )}

              {modalStep === "processing" && (
                <div className="space-y-8">
                  <div className="text-center">
                    <h3 className="text-2xl font-semibold mb-4">Analyzing Your Creator&apos;s Voice</h3>
                    <p className="text-muted-foreground">
                      We&apos;re analyzing {creatorInput} to create a comprehensive voice profile
                    </p>
                  </div>

                  {/* Processing Steps */}
                  <div className="space-y-6">
                    {processingSteps.map((step, index) => (
                      <div key={step.id} className="flex items-center gap-4">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          index < processingStep ? 'bg-green-500 text-white' :
                          index === processingStep ? 'bg-blue-500 text-white animate-pulse' :
                          'bg-muted text-muted-foreground'
                        }`}>
                          {index < processingStep ? (
                            <CheckCircle className="w-5 h-5" />
                          ) : (
                            <span className="text-sm font-semibold">{step.id}</span>
                          )}
                        </div>
                        <div className="flex-1">
                          <h4 className={`font-medium ${
                            index <= processingStep ? 'text-foreground' : 'text-muted-foreground'
                          }`}>
                            {step.title}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {step.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all duration-1000"
                      style={{ width: `${((processingStep + 1) / processingSteps.length) * 100}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {modalStep === "profile-review" && analysisResults && (
                <div className="space-y-8">
                  <div className="text-center">
                    <h3 className="text-2xl font-semibold mb-4">Voice Profile Created Successfully!</h3>
                    <p className="text-muted-foreground">
                      Here&apos;s what we discovered about {creatorInput}&apos;s communication style
                    </p>
                    {analysisResults.analysisData && (
                      <p className="text-sm text-muted-foreground mt-2">
                        Analyzed {analysisResults.analysisData.videosAnalyzed} videos from {analysisResults.analysisData.totalVideosFound} total posts
                      </p>
                    )}
                  </div>

                  {/* Voice Profile Summary */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Core Identity */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Voice Identity</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <h4 className="font-medium mb-2">Persona</h4>
                          <p className="text-sm text-muted-foreground">
                            {analysisResults.voiceProfile?.coreIdentity?.suggestedPersonaName || 'Content Creator Voice'}
                          </p>
                        </div>
                        <div>
                          <h4 className="font-medium mb-2">Dominant Tones</h4>
                          <div className="flex flex-wrap gap-2">
                            {(analysisResults.voiceProfile?.coreIdentity?.dominantTones || ['Conversational']).map((tone, index) => (
                              <Badge key={index} variant="secondary">{tone}</Badge>
                            ))}
                          </div>
                        </div>
                        <div>
                          <h4 className="font-medium mb-2">Signature Phrases</h4>
                          <div className="space-y-1">
                            {(analysisResults.voiceProfile?.coreIdentity?.toneExemplars || ['Engaging and authentic']).slice(0, 3).map((phrase, index) => (
                              <p key={index} className="text-sm text-muted-foreground italic">&quot;{phrase}&quot;</p>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Content Strategy */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Content Strategy</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <h4 className="font-medium mb-2">Hook Strategies</h4>
                          <div className="space-y-2">
                            {(analysisResults.voiceProfile?.contentStrategyBlueprints?.commonHookStrategies || []).map((hook, index) => (
                              <div key={index}>
                                <Badge variant="outline" className="text-xs">{hook.type}</Badge>
                                <p className="text-sm text-muted-foreground mt-1">{hook.template}</p>
                              </div>
                            ))}
                            {(!analysisResults.voiceProfile?.contentStrategyBlueprints?.commonHookStrategies || 
                              analysisResults.voiceProfile.contentStrategyBlueprints.commonHookStrategies.length === 0) && (
                              <p className="text-sm text-muted-foreground">Uses engaging questions and bold statements to capture attention</p>
                            )}
                          </div>
                        </div>
                        <div>
                          <h4 className="font-medium mb-2">Content Delivery</h4>
                          <div className="space-y-1">
                            {(analysisResults.voiceProfile?.contentStrategyBlueprints?.dominantGoldenNuggetDelivery?.patterns || 
                              ['Delivers clear, actionable value', 'Uses structured approach to information']).map((pattern, index) => (
                              <p key={index} className="text-sm text-muted-foreground">• {pattern}</p>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Voice DNA Directives */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Voice DNA - Key Directives</CardTitle>
                      <CardDescription>These guidelines will shape how AI generates content in this voice</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {(analysisResults.voiceProfile?.actionableSystemPromptComponents?.voiceDnaSummaryDirectives || [
                          'Maintain a conversational tone',
                          'Focus on delivering clear value',
                          'Engage directly with the audience',
                          'Use authentic and relatable language'
                        ]).map((directive, index) => (
                          <div key={index} className="flex items-start gap-2">
                            <CheckCircle className="w-4 h-4 text-green-500 mt-1 flex-shrink-0" />
                            <p className="text-sm">{directive.replace(/\*\*/g, '')}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between pt-4">
                    <Button
                      variant="ghost"
                      onClick={closeModal}
                      className="flex items-center gap-2"
                    >
                      <X className="h-4 w-4" />
                      Cancel
                    </Button>
                    <Button
                      className="bg-green-600 hover:bg-green-700 text-white px-8"
                      onClick={handleConfirmVoiceCreation}
                    >
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Create Voice
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VoicePage; 