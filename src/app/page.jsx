"use client";

import { useState, useEffect, useContext } from "react";
import { Search, Brain, Link as LinkIcon, FileText, BookOpen, PenTool, CheckCircle, Clock, Circle, ArrowUp, ChevronDown, Sparkles, Download, Copy, Loader2, Zap, Mic, ChevronRight, ChevronLeft, RefreshCw } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable"
import StylishHeadline from "@/components/common/StylishHeadline";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { GenericCard, CardSkeleton } from "@/components/common/GenericContentDisplay";
import WorkflowActionBar from "@/components/layout/WorkflowActionBar";
import AlternativeSelectionPanel from "@/components/layout/AlternativeSelectionPanel";
import { saveScript, getScriptById, getUserScripts } from "@/lib/firestoreService";
import { Timestamp } from 'firebase/firestore';
import { AuthContext } from "@/contexts/AuthContext";
import { useSearchParams, useRouter } from 'next/navigation';
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useTheme } from 'next-themes';
import OnboardingModal from "@/components/features/OnboardingModal";
import { useAiWriterContext } from "@/contexts/AiWriterContext";
import WelcomeMessage from "@/components/common/WelcomeMessage";
import { PulsatingButton } from "@/components/magicui/pulsating-button";
import { RainbowButton } from "@/components/magicui/rainbow-button";
import { BorderBeam } from "@/components/magicui/border-beam";
import { VoiceIndicator } from "@/components/ui/voice-indicator";
import VideoIdeaCard from "@/components/common/VideoIdeaCard";
import AudioRecordingColumn from "@/components/features/AudioRecordingColumn";
import { useTopBar } from "@/components/layout/TopBarProvider";
import { useTwitterVideoIdeas } from "@/hooks/useTwitterVideoIdeas";
import { useSettings } from "@/contexts/SettingsContext";

// Helper function to extract hostname
const getHostname = (url) => {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch (e) {
    return "Source";
  }
};

// Fallback video ideas (shown when Twitter ideas are not available)
const fallbackVideoIdeaCards = [
  {
    title: "5 productivity tips for remote workers",
    description: "Share actionable strategies to help remote workers stay focused and efficient throughout their workday.",
    category: "Productivity"
  },
  {
    title: "Morning routine for success",
    description: "Create a compelling narrative around morning habits that set the tone for a successful day.",
    category: "Lifestyle"
  },
  {
    title: "Beginner's guide to investing",
    description: "Break down complex investment concepts into digestible advice for financial newcomers.",
    category: "Finance"
  }
];

// Additional example ideas for the "Surprise Me" functionality
const exampleIdeas = [
  "5 productivity tips for remote workers",
  "How to cook the perfect pasta",
  "Beginner's guide to investing",
  "Morning routine for success",
  "Best budget travel destinations",
  "Easy home workout routines",
  "Healthy meal prep ideas",
  "Time management strategies",
  "Digital detox benefits",
  "Creative writing prompts"
];

const MainColumn = ({ localVideoIdea, setLocalVideoIdea }) => {
  const contextValues = useAiWriterContext();
  const { 
    videoIdea, 
    triggerSearch, 
    currentStep, 
    scriptComponents,
    activeVoiceProfile,
    isLoadingVoiceProfile,
    deactivateVoiceProfile
  } = contextValues;
  
  const router = useRouter();
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (videoIdea && !localVideoIdea) {
      setLocalVideoIdea(videoIdea);
    }
  }, [videoIdea, localVideoIdea, setLocalVideoIdea]);

  const handleSurpriseMe = () => {
    const randomIdea = exampleIdeas[Math.floor(Math.random() * exampleIdeas.length)];
    setLocalVideoIdea(randomIdea);
  };

  const handleDeactivateVoice = async () => {
    try {
      await deactivateVoiceProfile();
      console.log("[HomePage] Voice profile deactivated from main page");
      } catch (error) {
      console.error("Error deactivating voice:", error);
    }
  };

  const handleSearch = async () => {
    if (!localVideoIdea.trim()) {
      alert("Please enter a video idea first.");
        return;
    }
    
    if (isSubmitting) return; // Prevent double submission
    
    setIsSubmitting(true);
    
    try {
      // Immediately redirect to AI writer with video idea as URL param
      const encodedIdea = encodeURIComponent(localVideoIdea.trim());
      router.push(`/ai-writer?idea=${encodedIdea}`);
      
      // Start the search process in the background
      // Don't await here to allow immediate redirect
      triggerSearch(localVideoIdea).catch(error => {
        console.error("[HomePage] Error in background triggerSearch:", error);
      });
      } catch (error) {
      console.error("[HomePage] Error in handleSearch:", error);
      setIsSubmitting(false);
    }
  };

    return (
    <div className="flex flex-col w-full h-full min-h-0">
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-8 py-4 min-h-0">
        {/* Welcome Message and Hero Headline */}
        <div className="text-center mb-4 sm:mb-6 space-y-2 flex-shrink-0">
          <WelcomeMessage />
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-muted-foreground">
            What will you script today?
          </h1>
        </div>

        {/* Voice Profile Indicator */}
        {activeVoiceProfile && !isLoadingVoiceProfile && (
          <div className="max-w-xl mx-auto mb-3 sm:mb-5 flex-shrink-0">
            <VoiceIndicator
              voiceProfile={activeVoiceProfile}
              onDeactivate={handleDeactivateVoice}
              showDeactivate={true}
            />
          </div>
        )}

        {/* Main Input Section */}
        <div className="max-w-xl mx-auto w-full relative flex-shrink-0">
          <div className={`relative flex gap-2 items-center p-2 rounded-md bg-background border transition-all duration-300 ${isInputFocused ? 'border-accent ring-2 ring-accent ring-opacity-50 shadow-none' : 'border-border shadow-sm'}`}>
            <input 
              type="text" 
              placeholder={activeVoiceProfile ? `Generate a script using ${activeVoiceProfile.sourceProfile.username}'s voice...` : "Enter your video idea here..."}
              className="flex-grow px-3 py-2 border-none focus:ring-0 bg-transparent text-sm outline-none"
              value={localVideoIdea}
              onChange={(e) => setLocalVideoIdea(e.target.value)}
              onFocus={() => setIsInputFocused(true)}
              onBlur={() => setIsInputFocused(false)}
              onKeyDown={(e) => { 
                if (e.key === 'Enter') {
                  handleSearch();
                }
              }}
              disabled={isSubmitting}
            />
            <RainbowButton 
              variant="default"
              size="sm"
              onClick={handleSearch} 
              disabled={isSubmitting || !localVideoIdea.trim()}
            >
              Generate Script
            </RainbowButton>
          </div>
        </div>

        {/* Surprise Me Button */}
        <div className="mt-3 sm:mt-5 text-center flex-shrink-0">
          <PulsatingButton
            onClick={handleSurpriseMe}
            disabled={isSubmitting}
            className="mx-auto bg-muted text-muted-foreground hover:bg-muted/80 border border-border text-sm px-4 py-2"
            duration="2s"
          >
            ✨ Surprise Me
          </PulsatingButton>
        </div>
      </div>
    </div>
  );
};

const SideColumn = ({ onVideoIdeaSelect, isVisible = true }) => {
  const { userProfile } = useContext(AuthContext);
  const { openSettings } = useSettings();
  
  // Get user's topics and overview for Twitter search
  // Handle both new string format and legacy array format
  const userTopics = userProfile?.topics || null;
  const userOverview = userProfile?.overview || null;
  
  // Use Twitter video ideas hook
  const { 
    videoIdeas: twitterIdeas, 
    isLoading: isLoadingTwitter, 
    error: twitterError, 
    lastFetch,
    refreshIdeas 
  } = useTwitterVideoIdeas(userOverview, userTopics);
  
  // Use Twitter ideas if available, otherwise fallback
  const videoIdeasToShow = twitterIdeas.length > 0 ? twitterIdeas : fallbackVideoIdeaCards;
  
  // Show Twitter features if user has both topics and overview
  const showTwitterFeatures = userTopics && userOverview && (
    (typeof userTopics === 'string' && userTopics.trim().length > 0) ||
    (Array.isArray(userTopics) && userTopics.length > 0)
  );
  
  if (!isVisible) return null;
  
    return (
    <div className="h-full p-4 space-y-6">
      {/* Video Idea Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">
            {showTwitterFeatures ? 'Trending Ideas' : 'Popular Ideas'}
          </h2>
          
          {/* Refresh Button - Only show if Twitter features are enabled */}
          {showTwitterFeatures && (
            <Button
              variant="ghost"
              size="sm"
              onClick={refreshIdeas}
              disabled={isLoadingTwitter}
              className="h-8 w-8 p-0"
              title="Refresh ideas from Twitter trends"
            >
              <RefreshCw className={cn("h-4 w-4", isLoadingTwitter && "animate-spin")} />
            </Button>
          )}
            </div>

        {/* Twitter Status Info */}
        {showTwitterFeatures && (
          <div className="text-xs text-muted-foreground space-y-1">
            {lastFetch && (
              <p>Last updated: {lastFetch.toLocaleTimeString()}</p>
            )}
            {userTopics && (
              <p>Topics: {
                typeof userTopics === 'string' 
                  ? userTopics.slice(0, 50) + (userTopics.length > 50 ? '...' : '')
                  : Array.isArray(userTopics) 
                    ? userTopics.slice(0, 3).join(', ')
                    : ''
              }</p>
            )}
            {twitterError && (
              <Alert className="py-2">
                <AlertDescription className="text-xs">
                  {twitterError}. Showing fallback ideas.
                </AlertDescription>
              </Alert>
                    )}
                  </div>
                )}

        {/* Onboarding Prompt */}
        {!showTwitterFeatures && (
          <div className="relative">
            <Alert className="py-2 cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => openSettings('topics')}>
              <AlertDescription className="text-xs">
                Complete your profile with topics and overview to get personalized trending ideas.
                <span className="text-primary font-medium ml-1">→ Set up now</span>
              </AlertDescription>
            </Alert>
            <BorderBeam size={100} duration={12} delay={0} />
                  </div>
                )}

        {/* Loading State */}
        {isLoadingTwitter && videoIdeasToShow.length === 0 && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-20 bg-muted/30 rounded-lg"></div>
                            </div>
            ))}
                          </div>
                        )}
                        
        {/* Video Ideas */}
        <div className="space-y-3">
          {videoIdeasToShow.map((idea, index) => (
            <VideoIdeaCard
              key={`${idea.source || 'fallback'}-${index}`}
              title={idea.title}
              description={idea.description}
              category={idea.category}
              onClick={() => onVideoIdeaSelect(idea.title)}
            />
          ))}
                    </div>
                </div>

      {/* Recent Activity */}
      <div className="space-y-4">
        <h3 className="text-base font-medium text-foreground">
          Recent Activity
        </h3>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground text-center">
              Your recent scripts will appear here
            </p>
          </CardContent>
        </Card>
                    </div>
                  </div>
  );
};

const AiWriterPageContent = () => {
  const [showRecordingColumn, setShowRecordingColumn] = useState(false);
  const [localVideoIdea, setLocalVideoIdea] = useState("");
  const { setRecordButton, setCollapseButton } = useTopBar();

  // Handle record button click to show recording column
  const handleRecordClick = () => {
    setShowRecordingColumn(true);
  };

  // Handle collapse button click to hide recording column
  const handleCollapseClick = () => {
    setShowRecordingColumn(false);
  };

  // Handle video idea selection from side column
  const handleVideoIdeaSelect = (idea) => {
    setLocalVideoIdea(idea);
  };

  // Set up topbar buttons based on recording column state
  useEffect(() => {
    // Show record button only when recording column is NOT visible
    if (!showRecordingColumn) {
      setRecordButton(
                      <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleRecordClick}
          className="h-8 px-2 text-sm"
        >
          <Mic className="w-4 h-4 mr-1" />
          Record
                      </Button>
      );
    } else {
      setRecordButton(null);
    }
                      
    // Show collapse button only when recording column is visible
    if (showRecordingColumn) {
      setCollapseButton(
                      <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleCollapseClick}
          className="h-8 px-2 text-sm"
        >
          <ChevronRight className="w-4 h-4 mr-1" />
          Collapse
                      </Button>
      );
    } else {
      setCollapseButton(null);
    }

    // Cleanup when component unmounts
    return () => {
      setRecordButton(null);
      setCollapseButton(null);
    };
  }, [showRecordingColumn, setRecordButton, setCollapseButton]);

  return (
    <>
      <div className="h-full w-full relative -m-4 md:-m-6">
        {/* Main Layout with Resizable Panels */}
        <ResizablePanelGroup direction="horizontal" className="h-full">
          {/* Main Content Panel */}
          <ResizablePanel 
            defaultSize={showRecordingColumn ? 45 : 65} 
            minSize={35}
            maxSize={showRecordingColumn ? 60 : 75}
          >
            <div className="h-full p-4 md:p-6">
              <MainColumn localVideoIdea={localVideoIdea} setLocalVideoIdea={setLocalVideoIdea} />
              </div>
          </ResizablePanel>

          {/* Resizable Handle */}
          <ResizableHandle withHandle />

          {/* Side Panel (Video Ideas) */}
          <ResizablePanel 
            defaultSize={showRecordingColumn ? 30 : 35} 
            minSize={20} 
            maxSize={45}
            className="overflow-y-auto"
          >
            <div className="h-full overflow-y-auto">
              <SideColumn onVideoIdeaSelect={handleVideoIdeaSelect} />
              </div>
          </ResizablePanel>

          {/* Recording Column - Conditionally Rendered */}
          {showRecordingColumn && (
            <>
              <ResizableHandle withHandle />
              <ResizablePanel 
                defaultSize={25} 
                minSize={20} 
                maxSize={35}
                className="overflow-y-auto"
              >
                <div className="h-full overflow-y-auto">
                  <AudioRecordingColumn />
            </div>
              </ResizablePanel>
          </>
        )}
        </ResizablePanelGroup>
      </div>
    </>
  );
};

export default function HomePage() {
  return <AiWriterPageContent />;
} 