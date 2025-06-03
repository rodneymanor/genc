"use client";

import { useState, useEffect, useContext } from "react";
import { Search, Brain, Link as LinkIcon, FileText, BookOpen, PenTool, CheckCircle, Clock, Circle, ArrowUp, ChevronDown, Sparkles, Download, Copy, Loader2, Zap } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
// Removed AuroraText import as StylishHeadline likely handles it or uses it internally
import StylishHeadline from "@/components/common/StylishHeadline"; // Import the StylishHeadline component
import { Alert, AlertDescription } from "@/components/ui/alert"; // Added from dashboard
import { Badge } from "@/components/ui/badge"; // Added from dashboard
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel, // Added for section labels
  DropdownMenuSeparator, // Added for visual separation
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"; // Added Dropdown imports
import { GenericCard, CardSkeleton } from "@/components/common/GenericContentDisplay"; // Added GenericCard imports
import WorkflowActionBar from "@/components/layout/WorkflowActionBar"; // Import WorkflowActionBar
import AlternativeSelectionPanel from "@/components/layout/AlternativeSelectionPanel"; // Import AlternativeSelectionPanel
import { saveScript, getScriptById, getUserScripts } from "@/lib/firestoreService"; // Import getScriptById
import { Timestamp } from 'firebase/firestore'; // Import Timestamp for type usage
import { AuthContext } from "@/contexts/AuthContext"; // Corrected and primary AuthContext import
import { useSearchParams, useRouter } from 'next/navigation'; // Import useSearchParams and useRouter
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useTheme } from 'next-themes';
import OnboardingModal from "@/components/features/OnboardingModal";
import { useAiWriterContext } from "@/contexts/AiWriterContext";
import GhostwriterSection from "@/components/ghostwriter/GhostwriterSection"; // Added import
import FloatingVoiceRecorder from "@/components/features/FloatingVoiceRecorder"; // Added import
import AiProcessingModal from "@/components/features/AiProcessingModal"; // Added import
import WelcomeMessage from "@/components/common/WelcomeMessage";
import { PulsatingButton } from "@/components/magicui/pulsating-button";
import { BorderBeam } from "@/components/magicui/border-beam";
import { RainbowButton } from "@/components/magicui/rainbow-button";
import { VoiceIndicator } from "@/components/ui/voice-indicator";

// Helper function to extract hostname
const getHostname = (url) => {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch (e) {
    return "Source"; // Fallback
  }
};

// ActionButton component using ShadCN Button
const ActionButton = ({ children, onClick, className = "", icon: Icon, isLoading, disabled }) => {
  return (
    <Button
      onClick={onClick}
      className={`w-full max-w-xs mx-auto py-3 h-12 text-base font-semibold bg-primary text-primary-foreground hover:bg-primary/90 disabled:bg-muted shadow-lg hover:shadow-xl transition-all ${className}`}
      size="lg"
      disabled={isLoading || disabled}
    >
      {isLoading ? children.replace("Find Sources", "Searching for sources...").replace("Generate Outline", "Generating outline...") : (
        <>
      {Icon && <Icon className="mr-2 h-5 w-5" />}
      {children}
        </>
      )}
    </Button>
  )
}

// Flowbite-style Tabs Component
const FlowbiteTabs = ({ activeTab, onTabChange, tabs, children }) => {
  return (
    <div className="w-full flex flex-col items-center">
      {/* Tab Navigation - 700px wide with bottom border */}
      <div className="w-[700px] border-b border-gray-200">
        <ul className="flex flex-wrap -mb-px text-sm font-medium">
          {tabs.map((tab) => (
            <li key={tab.id} className="me-2">
              <button
                onClick={() => !tab.disabled && onTabChange(tab.id)}
                disabled={tab.disabled}
                className={`inline-flex items-center justify-center p-4 border-b-2 rounded-t-lg group transition-colors ${
                  activeTab === tab.id
                    ? 'text-foreground border-b-primary font-semibold'
                    : tab.disabled
                    ? 'text-muted-foreground cursor-not-allowed font-normal border-transparent'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted font-medium'
                }`}
              >
                {tab.stepLabel && (
                  <span className={`text-xs font-bold me-2 px-2 py-1 rounded transition-colors ${
                    activeTab === tab.id
                      ? 'text-foreground'
                      : tab.disabled
                      ? 'text-muted-foreground'
                      : 'text-muted-foreground group-hover:bg-accent group-hover:bg-opacity-50'
                  }`}>
                    {tab.stepLabel}
                  </span>
                )}
                <span className="hidden sm:inline">{tab.label}</span>
                {tab.status && (
                  <div className="flex items-center gap-1 ml-2">
                    <tab.status.icon className={`h-3 w-3 ${tab.status.color}`} />
                    <span className={`text-xs font-medium ${tab.status.color} hidden md:inline`}>{tab.status.text}</span>
                  </div>
                )}
              </button>
            </li>
          ))}
        </ul>
      </div>
      
      {/* Tab Content */}
      <div className="mt-6">
        {children}
      </div>
    </div>
  );
};

// Tab Content Component
const TabContent = ({ value, activeTab, children }) => {
  if (value !== activeTab) return null;
  return <div>{children}</div>;
};

// ContentCard component (from dashboard)
const ContentCard = ({ title, description, badge }) => {
  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer border-border hover:border-primary/20">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">{title}</CardTitle>
          {badge && (
            <Badge variant="secondary" className="text-xs">
              {badge}
            </Badge>
          )}
        </div>
        {description && (
          <CardDescription className="text-sm text-muted-foreground">
            {description}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="pt-0">
        <div className="text-sm text-muted-foreground">
          Click to explore →
        </div>
      </CardContent>
    </Card>
  )
}

// Recent Scripts component (from dashboard)
const RecentScripts = () => {
  const [scripts, setScripts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { userProfile, loading: authLoading } = useContext(AuthContext);
  const router = useRouter();

  useEffect(() => {
    // Don't fetch if auth is still loading or if userProfile is explicitly null (logged out)
    if (authLoading) {
      setIsLoading(true); // Show loading while auth state is resolving
      return;
    }
    if (!userProfile) {
      setIsLoading(false);
      setScripts([]); // Clear scripts if no user
      setError("Log in to see your recent scripts.");
      return;
    }

    if (userProfile.uid) {
      setIsLoading(true);
      getUserScripts(userProfile.uid, 3) // Fetch latest 3 scripts
        .then((fetchedScripts) => {
          setScripts(fetchedScripts);
          setError(null);
        })
        .catch((err) => {
          console.error("Error fetching recent scripts:", err);
          setError("Failed to load recent scripts.");
          setScripts([]);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [userProfile, authLoading]);

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    // Check if it's a Firestore Timestamp, if so, convert to Date
    const date = timestamp instanceof Timestamp ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString(); // Simpler date format for recent scripts
  };
  
  const handleScriptClick = (scriptId) => {
    router.push(`/?loadScriptId=${scriptId}`);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Recent Scripts</CardTitle>
        <CardDescription>Your latest script writing projects</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading && (
          <div className="flex justify-center items-center py-4">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <p className="ml-3 text-muted-foreground">Loading scripts...</p>
          </div>
        )}
        {error && !isLoading && (
          <div className="text-center py-4 text-destructive">
            <p>{error}</p>
          </div>
        )}
        {!isLoading && !error && scripts.length === 0 && (
          <div className="text-center py-10">
            <BookOpen className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
            <p className="text-muted-foreground">No recent scripts found.</p>
            { !userProfile && <p className="text-xs text-muted-foreground mt-1">Log in to see your work.</p>}
          </div>
        )}
        {!isLoading && !error && scripts.length > 0 && (
          <div className="space-y-3">
            {scripts.map((script) => (
              <div 
                key={script.id} 
                className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors cursor-pointer"
                onClick={() => handleScriptClick(script.id)}
              >
                <div className="flex-1 overflow-hidden">
                  <h4 className="font-medium text-sm truncate" title={script.title || 'Untitled Script'}>
                    {script.title || 'Untitled Script'}
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    Updated: {formatDate(script.updatedAt)}
                  </p>
                </div>
                {/* Optional: Could add a status badge here if scripts have status */}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Progress Status Component
const getProgressStatus = (step, sources, scriptComponents, isLoading, isGeneratingOutline) => {
  switch (step) {
    case "sources":
      if (isLoading) return { icon: Clock, text: "Searching...", color: "text-blue-500" };
      if (sources.length > 0) return { icon: CheckCircle, text: "Complete", color: "text-green-500" };
      return { icon: Circle, text: "Pending", color: "text-muted-foreground" };
    
    case "outlines":
      if (isGeneratingOutline) return { icon: Clock, text: "Generating...", color: "text-blue-500" };
      if (scriptComponents) return { icon: CheckCircle, text: "Complete", color: "text-green-500" };
      if (sources.length > 0) return { icon: Circle, text: "Ready", color: "text-muted-foreground" };
      return { icon: Circle, text: "Pending", color: "text-muted-foreground" };
    
    case "final":
      if (scriptComponents) return { icon: Circle, text: "Ready", color: "text-muted-foreground" };
      return { icon: Circle, text: "Pending", color: "text-muted-foreground" };
    
    default:
      return { icon: Circle, text: "Pending", color: "text-muted-foreground" };
  }
};

// Utility function to generate unique script ID
const generateScriptId = () => {
  return `script_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Example ideas for the "Surprise Me" functionality
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

const AiWriterPageContent = () => {
  const contextValues = useAiWriterContext();
  const { 
    videoIdea, 
    triggerSearch, 
    currentStep, 
    isProcessing, 
    scriptComponents,
    activeVoiceProfile,
    isLoadingVoiceProfile,
    deactivateVoiceProfile
  } = contextValues;
  
  console.log("[HomePage] AiWriterContext values:", {
    videoIdea,
    currentStep,
    isProcessing,
    triggerSearchExists: !!triggerSearch,
    activeVoiceProfile: activeVoiceProfile?.name || "None"
  });
  
  const router = useRouter();
  const [localVideoIdea, setLocalVideoIdea] = useState("");
  const [showProcessingModal, setShowProcessingModal] = useState(false);
  const [generatedScriptId, setGeneratedScriptId] = useState(null);
  const [isInputFocused, setIsInputFocused] = useState(false);

  useEffect(() => {
    setLocalVideoIdea(videoIdea || "");
  }, [videoIdea]);

  // Debug logging for state changes
  useEffect(() => {
    console.log("[HomePage DEBUG] isInputFocused changed:", isInputFocused);
  }, [isInputFocused]);

  // Log CSS variables to check if theme colors are available
  useEffect(() => {
    const rootStyles = getComputedStyle(document.documentElement);
    console.log("[HomePage DEBUG] CSS Variables:", {
      primary: rootStyles.getPropertyValue('--primary'),
      accent: rootStyles.getPropertyValue('--accent'),
      ring: rootStyles.getPropertyValue('--ring'),
      border: rootStyles.getPropertyValue('--border')
    });
  }, []);

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
    console.log("[HomePage] handleSearch called with localVideoIdea:", localVideoIdea);
    
    if (!localVideoIdea.trim()) {
      console.log("[HomePage] Empty video idea, showing alert");
      alert("Please enter a video idea first.");
        return;
    }
    
    try {
      console.log("[HomePage] Starting processing flow");
      
      // Generate unique script ID for later navigation
      const scriptId = generateScriptId();
      console.log("[HomePage] Generated script ID:", scriptId);
      setGeneratedScriptId(scriptId);
      
      // Show the processing modal immediately
      console.log("[HomePage] Setting showProcessingModal to true");
      setShowProcessingModal(true);
      
      // Start the AI processing (this will automatically include voice profile from context)
      console.log("[HomePage] Calling triggerSearch with voice profile:", activeVoiceProfile?.name || "None");
      await triggerSearch(localVideoIdea);
      console.log("[HomePage] triggerSearch completed");
      
        } catch (error) {
      console.error("[HomePage] Error in handleSearch:", error);
      setShowProcessingModal(false);
      alert("An error occurred while starting the script generation. Please try again.");
      }
  };

  const handleProcessingComplete = () => {
    // Close the modal and navigate to the results page
    setShowProcessingModal(false);
    if (generatedScriptId) {
      router.push(`/ai-writer/${generatedScriptId}`);
    }
  };

    return (
    <>
      <div className="flex flex-col w-full space-y-4 md:space-y-6 pb-12">
        {/* Search Input Section */}
        <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-32">
          {/* Welcome Message and Hero Headline - Combined */}
          <div className="flex flex-col gap-1.5 text-center mb-8">
            <WelcomeMessage />
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-muted-foreground">
              What will you script today?
            </h1>
            </div>

          {/* Voice Profile Indicator - Displayed prominently above input */}
          {activeVoiceProfile && !isLoadingVoiceProfile && (
            <div className="max-w-2xl mx-auto mb-6">
              <VoiceIndicator
                voiceProfile={activeVoiceProfile}
                onDeactivate={handleDeactivateVoice}
                showDeactivate={true}
              />
            </div>
          )}
        
          <div className="max-w-2xl mx-auto relative">
            <div className={`relative flex gap-2 items-center p-3 rounded-lg bg-background border transition-all duration-300 ${isInputFocused ? 'border-accent ring-2 ring-accent ring-opacity-50 shadow-none' : 'border-border shadow-sm'}`}>
              <input 
                type="text" 
                placeholder={activeVoiceProfile ? `Generate a script using ${activeVoiceProfile.sourceProfile.username}'s voice...` : "Enter your video idea here..."}
                className="flex-grow p-2 border-none focus:ring-0 bg-transparent text-base outline-none"
                value={localVideoIdea}
                onChange={(e) => setLocalVideoIdea(e.target.value)}
                onFocus={() => {
                  console.log("[HomePage DEBUG] Input focused - Ring should appear");
                  setIsInputFocused(true);
                }}
                onBlur={() => {
                  console.log("[HomePage DEBUG] Input blurred - Ring should disappear");
                  setIsInputFocused(false);
                }}
                onKeyDown={(e) => { 
                  console.log("[HomePage] Key pressed:", e.key);
                  if (e.key === 'Enter') {
                    console.log("[HomePage] Enter key detected, calling handleSearch");
                    handleSearch();
                  }
                }}
                disabled={showProcessingModal}
              />
              <RainbowButton 
                variant="default"
                size="default"
                onClick={() => {
                  console.log("[HomePage] Generate Script button clicked");
                  handleSearch();
                }} 
                disabled={showProcessingModal}
              >
                {showProcessingModal ? "Processing..." : "Generate Script"}
              </RainbowButton>
                            </div>
                          </div>

          {/* Surprise Me Button */}
          <div className="mt-6 text-center">
            <PulsatingButton
              onClick={handleSurpriseMe}
              disabled={showProcessingModal}
              className="mx-auto bg-muted text-muted-foreground hover:bg-muted/80 border border-border"
              duration="2s"
            >
              ✨ Surprise Me
            </PulsatingButton>
                        </div>
                      </div>
                  </div>

      {/* AI Processing Modal */}
      <AiProcessingModal
        isOpen={showProcessingModal}
        currentStep={currentStep}
        videoIdea={localVideoIdea}
        onComplete={handleProcessingComplete}
      />
    </>
  );
};

export default function HomePage() {
  return (
          <>
      <AiWriterPageContent />
      <GhostwriterSection />
      <FloatingVoiceRecorder />
          </>
  );
} 