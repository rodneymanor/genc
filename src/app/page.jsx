"use client";

import { useState, useEffect, useContext } from "react";
import { Search, Brain, Link as LinkIcon, FileText, BookOpen, PenTool, CheckCircle, Clock, Circle, ArrowUp, ChevronDown, Sparkles, Download, Copy, Loader2 } from "lucide-react"
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
import ThinkingTimeline from "@/components/interactive/ThinkingTimeline"; // Import ThinkingTimeline

// Helper function to extract hostname
const getHostname = (url) => {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch (e) {
    return "Source"; // Fallback
  }
};



// Modified StandardizedInputGroup for a more integrated look
const StandardizedInputGroup = ({
  className = "",
  value,
  onChange,
  onButtonClick,
  isButtonLoading,
  isButtonDisabled,
  inputType,
  onInputTypeChange,
  sourceOption,
  onSourceOptionChange,
}) => {
  return (
    <div 
      style={{ width: '640px', height: '120px' }}
      className={`relative mx-auto border-2 border-gray-300 bg-white rounded-lg shadow-sm hover:shadow-md focus-within:border-black transition-colors ${className}`}
    >
      <textarea
        placeholder={inputType === "Description" ? "Add your video idea..." : "Enter URL to rewrite..."}
        className="box-border w-full h-[64px] pl-4 pr-4 pt-2 pb-4 text-base leading-normal text-black font-medium bg-transparent border-none focus:ring-0 block placeholder:text-gray-500 resize-none"
        value={value}
        onChange={onChange}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault(); // Prevent newline
            if (!isButtonDisabled && !isButtonLoading) { // Check if submission is allowed
              onButtonClick(); // Trigger the same action as the button click
            }
          }
        }}
      />
      <div className="absolute bottom-0 left-0 right-0 h-14 px-3 py-2 flex justify-between items-center">
        <div className="flex items-center space-x-2"> {/* Container for both dropdowns */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="text-sm font-medium text-black hover:bg-gray-100 px-2">
                {inputType}
                <ChevronDown className="ml-1 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem onClick={() => onInputTypeChange("Description")}>
                Description
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onInputTypeChange("URL")}>
                URL
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="text-sm font-medium text-black hover:bg-gray-100 px-2">
                Sources: {sourceOption}
                <ChevronDown className="ml-1 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem onClick={() => onSourceOptionChange("1x")}>
                1x
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onSourceOptionChange("9x")}>
                9x
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <Button
          onClick={onButtonClick}
          disabled={isButtonLoading || isButtonDisabled}
          className="w-7 h-7 p-0 flex items-center justify-center bg-black text-white rounded-lg hover:bg-gray-800 disabled:bg-gray-400 shadow-md transition-all"
        >
          {isButtonLoading ? (
            <Clock className="h-5 w-5 animate-spin" />
          ) : (
            <ArrowUp className="h-6 w-6" />
          )}
        </Button>
      </div>
    </div>
  );
};

// ActionButton component using ShadCN Button
const ActionButton = ({ children, onClick, className = "", icon: Icon, isLoading, disabled }) => {
  return (
    <Button
      onClick={onClick}
      className={`w-full max-w-xs mx-auto py-3 h-12 text-base font-semibold bg-black text-white hover:bg-gray-800 disabled:bg-gray-400 shadow-lg hover:shadow-xl transition-all ${className}`}
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
                className={`inline-flex items-center justify-center p-4 border-b-2 rounded-t-lg group transition-colors ${
                  activeTab === tab.id
                    ? 'text-black border-b-[#000000] font-semibold'
                    : tab.disabled
                    ? 'text-gray-400 cursor-not-allowed font-normal border-transparent'
                    : 'border-transparent text-gray-600 hover:text-black hover:border-gray-400 font-medium'
                }`}
                style={activeTab === tab.id ? { borderBottom: '3px solid black' } : {}}
                disabled={tab.disabled}
                aria-current={activeTab === tab.id ? 'page' : undefined}
              >
                {tab.stepLabel && (
                  <span className={`text-xs font-bold me-2 px-2 py-1 rounded transition-colors ${
                    activeTab === tab.id
                      ? 'text-black'
                      : tab.disabled
                      ? 'text-gray-400'
                      : 'text-gray-600 group-hover:bg-gray-100 group-hover:bg-opacity-50'
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
    
    case "tasks":
    default:
      return { icon: Circle, text: "Pending", color: "text-muted-foreground" };
  }
};

// This is the main component for the /create-script/idea route
export default function HomePage() {
  // const { userProfile, loading: authLoading } = useAuth(); // REMOVE THIS LINE - Use useContext below
  const [videoIdea, setVideoIdea] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingOutline, setIsGeneratingOutline] = useState(false);
  const [apiResponse, setApiResponse] = useState(null);
  const [sources, setSources] = useState([]);
  const [geminiSummary, setGeminiSummary] = useState("");
  const [scriptComponents, setScriptComponents] = useState(null);
  const [outlineProgress, setOutlineProgress] = useState("");
  const [outlineError, setOutlineError] = useState(null);
  const [activeTab, setActiveTab] = useState("sources");
  const [workflowStarted, setWorkflowStarted] = useState(false);
  const [inputType, setInputType] = useState("Description");
  const [sourceOption, setSourceOption] = useState("9x"); // Changed default to "9x"
  const [selectedScriptItems, setSelectedScriptItems] = useState({});
  const [editingSelection, setEditingSelection] = useState({ category: null, alternatives: [] });
  const [finalScriptText, setFinalScriptText] = useState(""); // New state for final script
  const [currentScriptId, setCurrentScriptId] = useState(null); // For tracking current script doc ID, removed TS type
  const [isSaving, setIsSaving] = useState(false); // To indicate saving state
  const [saveTimeoutId, setSaveTimeoutId] = useState(null); // Removed NodeJS.Timeout type for JSX
  const [copySuccess, setCopySuccess] = useState(false); // For copy button feedback
  const [currentWorkflowStep, setCurrentWorkflowStep] = useState("init"); // For timeline tracking
  const [workflowErrorStep, setWorkflowErrorStep] = useState(null); // For timeline error tracking

  // Use AuthContext directly
  const { userProfile, loading: authLoading } = useContext(AuthContext);
  const searchParams = useSearchParams();
  const router = useRouter();

  let firstName = null;
  if (userProfile && userProfile.displayName) {
    firstName = userProfile.displayName.split(' ')[0];
  }

  const canGenerateOutline = sources.length > 0 && !isGeneratingOutline;
  const canProceedToFinalScript = !!scriptComponents && !isGeneratingOutline; // Added !isGeneratingOutline here too

  const tabs = [
    { id: "tasks", label: "Tasks", stepLabel: "Workflow", disabled: false, status: getProgressStatus("tasks", sources, scriptComponents, isLoading, isGeneratingOutline) },
    { id: "sources", label: "Sources", stepLabel: "Discovery", disabled: sources.length === 0 && !isLoading, status: getProgressStatus("sources", sources, scriptComponents, isLoading, isGeneratingOutline) },
    { id: "outlines", label: "Outline", stepLabel: "Structure", disabled: !scriptComponents, status: getProgressStatus("outlines", sources, scriptComponents, isLoading, isGeneratingOutline) },
    { id: "final", label: "Final Version", stepLabel: "Polish", disabled: !scriptComponents, status: getProgressStatus("final", sources, scriptComponents, isLoading, isGeneratingOutline) }
  ];

  const handleFindSources = async () => {
    setIsLoading(true);
    setApiResponse(null);
    setSources([]);
    setGeminiSummary("");
    setScriptComponents(null);
    setOutlineError(null);
    setActiveTab("sources"); // Ensure the first tab is active on new search
    setWorkflowStarted(true); // THIS IS KEY: Show tabs once search starts
    setCurrentWorkflowStep("search"); // Set initial workflow step
    setWorkflowErrorStep(null); // Reset error step
    console.log("Finding sources for idea:", videoIdea);

    try {
      const url = new URL('/api/test-gemini-search', window.location.origin);
      url.searchParams.append('videoIdea', videoIdea);

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await response.json();
      setApiResponse({ status: response.status, data });

      if (response.ok && data.sources) {
        console.log("API call successful, sources found:", data.sources);
        setSources(data.sources);
        if (data.sources.length > 0) {
          setCurrentWorkflowStep("analyze_ready");
        } else {
          setCurrentWorkflowStep("search_empty");
        }
        if(data.logs) {
          const summaryLog = data.logs.find(log => log.startsWith("--- Gemini's Summary of Found Sources ---"));
          if (summaryLog) {
            const summaryText = data.logs.slice(data.logs.indexOf(summaryLog) + 1).join("\n");
            setGeminiSummary(summaryText.replace("\\nTest completed.", "").trim());
          } else if (data.logs.includes("[Gemini] No final text response. Full response parts:")){
            setGeminiSummary("Gemini did not provide a final text summary, but sources were found.")
          } else {
            setGeminiSummary("Gemini provided a response, check logs for details.")
          }
        }
      } else {
        console.error("API call failed or no sources in response:", data);
        setSources([]);
        setGeminiSummary(data.error || "Failed to fetch sources.");
        setCurrentWorkflowStep("search_failed");
        setWorkflowErrorStep("search_failed");
      }
    } catch (error) {
      console.error("Network or other error:", error);
      setApiResponse({ status: 'network_error', data: { error: error.message } });
      setGeminiSummary("An error occurred while trying to fetch sources.");
      setCurrentWorkflowStep("search_failed");
      setWorkflowErrorStep("search_failed");
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function for Step 1: Extract content from sources
  async function extractAllSourceContent(currentSources, setProgress) {
    setProgress("Step 1/3: Extracting content from sources...");
    const sourceContents = [];
    console.log(`[Outline Gen] Starting content extraction for ${currentSources.length} sources`);

    for (let i = 0; i < currentSources.length; i++) {
      const source = currentSources[i];
      setProgress(`Step 1/3: Extracting source ${i + 1} of ${currentSources.length}: ${source.title}`);
      console.log(`[Outline Gen] Extracting content from: ${source.link}`);

      try {
        const extractResponse = await fetch('/api/extract-content', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: source.link }),
        });
        const extractData = await extractResponse.json();

        console.log(`[Outline Gen] Extract response for ${source.link}:`, {
          ok: extractResponse.ok,
          status: extractResponse.status,
          hasText: !!extractData.extractedText,
          textLength: extractData.extractedText?.length || 0,
          error: extractData.error
        });

        if (extractResponse.ok && extractData.extractedText) {
          sourceContents.push({
            link: source.link,
            title: source.title,
            text: extractData.extractedText
          });
          console.log(`[Outline Gen] ✓ Successfully extracted ${extractData.extractedText.length} characters from ${source.title}`);
        } else {
          console.warn(`[Outline Gen] ⚠ Extraction failed for ${source.title} (Status: ${extractResponse.status}, API Error: ${extractData.error || 'N/A'}), using snippet as fallback.`);
          sourceContents.push({
            link: source.link,
            title: source.title,
            text: source.snippet || "Content extraction failed, snippet used."
          });
        }
      } catch (error) {
        console.error(`[Outline Gen] ❌ Network/fetch error during content extraction for ${source.link}:`, error);
        sourceContents.push({
          link: source.link,
          title: source.title,
          text: source.snippet || "Content extraction failed due to network/fetch error, snippet used."
        });
      }
    }
    console.log(`[Outline Gen] Content extraction complete. Processed ${sourceContents.length} sources.`);
    return sourceContents;
  }

  // Helper function for Step 2: Create research analysis
  async function createResearchAnalysis(videoIdea, sourceContents, setProgress) {
    setProgress("Step 2/3: Creating research analysis...");
    console.log("[Outline Gen] Starting research analysis creation...");
    try {
      const analysisResponse = await fetch('/api/create-research-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoIdea, sourceContents }),
      });
      const analysisData = await analysisResponse.json();
      console.log("[Outline Gen] Research analysis response details:", { ok: analysisResponse.ok, status: analysisResponse.status, data: analysisData });
      if (!analysisResponse.ok || !analysisData.researchAnalysisText) {
        const errorMsg = analysisData.error || `Failed to create research analysis (status ${analysisResponse.status})`;
        console.error("[Outline Gen] ❌ Error in Step 2 (Create Research Analysis):", errorMsg, analysisData.logs);
        throw new Error(errorMsg);
      }
      console.log(`[Outline Gen] ✓ Research analysis created successfully (length: ${analysisData.researchAnalysisText.length}).`);
      return analysisData.researchAnalysisText;
    } catch (error) {
      console.error("[Outline Gen] ❌ Error in research analysis step:", error);
      throw error; // Re-throw to be handled by handleGenerateOutline
    }
  }

  // Helper function for Step 3: Generate script components
  async function generateScriptComponents(videoIdea, researchAnalysisText, setProgress) {
    setProgress("Step 3/3: Generating script components...");
    console.log("[Outline Gen] Starting script components generation with research text length:", researchAnalysisText.length);
    try {
      const componentsResponse = await fetch('/api/generate-script-components', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoIdea, researchAnalysisText }),
      });
      console.log("[Outline Gen] Script components API response status:", componentsResponse.status);
      if (!componentsResponse.ok) {
        let errorText = 'Unknown error from script components API.';
        try {
          errorText = await componentsResponse.text();
        } catch (textError) {
          console.warn("[Outline Gen] Could not parse error text from script components API.");
        }
        console.error("[Outline Gen] ❌ Script components API responded with non-OK status:", componentsResponse.status, errorText);
        const detailedError = `Failed to generate script components (status ${componentsResponse.status}): ${errorText.substring(0, 200)}`;
        throw new Error(detailedError);
      }
      const componentsData = await componentsResponse.json();
      console.log("[Outline Gen] Script components raw data received from API:", componentsData);

      if (!componentsData || typeof componentsData !== 'object' || !componentsData.hooks || !componentsData.factsets || !componentsData.outros) {
        const errorMsg = "Received invalid or incomplete data structure for script components.";
        console.error("[Outline Gen] ❌ Invalid componentsData structure:", componentsData, errorMsg);
        throw new Error(errorMsg);
      }
      console.log("[Outline Gen] ✓ Script components data received and validated.");
      return componentsData;
    } catch (error) {
      console.error("[Outline Gen] ❌ Error fetching/parsing script components (Step 3):", error);
      throw error; // Re-throw to be handled by handleGenerateOutline
    }
  }

  const handleGenerateOutline = async () => {
    setIsGeneratingOutline(true);
    setScriptComponents(null);
    setOutlineError(null);
    setOutlineProgress("Starting outline generation...");
    setCurrentWorkflowStep("extract");
    setWorkflowErrorStep(null);
    console.log("[Outline Gen] Initializing outline generation process...");

    try {
      const extractedContents = await extractAllSourceContent(sources, setOutlineProgress);
      setCurrentWorkflowStep("analyze");
      const analysisText = await createResearchAnalysis(videoIdea, extractedContents, setOutlineProgress);
      setCurrentWorkflowStep("generate_options");
      const finalComponents = await generateScriptComponents(videoIdea, analysisText, setOutlineProgress);

      setScriptComponents(finalComponents);
      // Initialize selectedScriptItems with the first item from each category
      const initialSelected = {};
      if (finalComponents.hooks && finalComponents.hooks.length > 0) {
        initialSelected.hook = finalComponents.hooks[0];
      }
      if (finalComponents.factsets && finalComponents.factsets.length > 0) {
        initialSelected.factset = finalComponents.factsets[0]; // Assuming we want to pick one factset to start
      }
      if (finalComponents.outros && finalComponents.outros.length > 0) {
        initialSelected.outro = finalComponents.outros[0];
      }
      if (finalComponents.takes && finalComponents.takes.length > 0) {
        initialSelected.take = finalComponents.takes[0]; // Assuming one take
      }
      setSelectedScriptItems(initialSelected);

      setCurrentWorkflowStep("outline_ready");
      setOutlineProgress("Outline generated successfully!");
      setActiveTab("outlines"); // Switch to outlines tab when generation is complete
      setEditingSelection({ category: null, alternatives: [] }); // Reset editing panel
      console.log("[Outline Gen] Final script components successfully set in state.");

    } catch (error) {
      console.error("[Outline Gen] ❌ Overall error in handleGenerateOutline function:", error);
      setOutlineError(error.message || "An unknown error occurred during outline generation.");
      setOutlineProgress("An error occurred. Please check console for details.");
      setCurrentWorkflowStep("generate_failed");
      setWorkflowErrorStep("generate_failed");
    } finally {
      setIsGeneratingOutline(false);
      console.log("[Outline Gen] Outline generation process has ended.");
    }
  };

  const assembleFinalScript = (items) => {
    let script = "";
    // Define the order of sections
    const sectionOrder = ['hook', 'factset', 'take', 'outro']; 

    sectionOrder.forEach(key => {
      const item = items[key];
      if (item) {
        if (item.title) {
          script += `## ${item.title}\n\n`;
        } else if (item.category) { // For factsets
          script += `## ${item.category}\n\n`;
        } else if (item.perspective) { // For takes
          script += `## ${item.perspective}\n\n`;
        }

        if (item.lines && Array.isArray(item.lines)) {
          item.lines.forEach(line => {
            script += `${line}\n`;
          });
          script += "\n"; 
        } else if (item.content) {
          script += `${item.content}\n\n`;
        }
      }
    });
    return script.trim();
  };

  const handleProceedToFinalScript = () => {
    const assembledScript = assembleFinalScript(selectedScriptItems);
    setFinalScriptText(assembledScript);
    setCurrentWorkflowStep("complete");
    setActiveTab("final"); 
  };

  const handleEditRequest = (category) => {
    if (!scriptComponents || !selectedScriptItems[category.toLowerCase()]) return;

    const currentSelectedItem = selectedScriptItems[category.toLowerCase()];
    let allItemsInCategory = [];

    switch (category) {
      case 'Hook':
        allItemsInCategory = scriptComponents.hooks || [];
        break;
      case 'Factset': // Assuming 'Factset' maps to 'factsets' in scriptComponents
        allItemsInCategory = scriptComponents.factsets || [];
        break;
      case 'Outro':
        allItemsInCategory = scriptComponents.outros || [];
        break;
      case 'Take':
        allItemsInCategory = scriptComponents.takes || [];
        break;
      default:
        console.warn("Unknown category for editing:", category);
        return;
    }
    
    // Ensure currentSelectedItem has an ID or a way to compare it (e.g. deep equality or unique prop like title for simple cases)
    // For now, assuming title is unique enough for filtering. Ideally, items should have stable IDs.
    const alternatives = allItemsInCategory.filter(
      (item) => item.title !== currentSelectedItem.title // Basic comparison, might need improvement
    );

    setEditingSelection({
      category: category,
      alternatives: alternatives,
    });
  };

  const handleSelectItemFromPanel = (newItem) => {
    if (!editingSelection.category) return;

    const categoryKey = editingSelection.category.toLowerCase();
    const oldItem = selectedScriptItems[categoryKey];

    setSelectedScriptItems(prev => ({
      ...prev,
      [categoryKey]: newItem,
    }));

    // Update alternatives: remove new item, add old item back
    const updatedAlternatives = editingSelection.alternatives
      .filter(alt => alt.title !== newItem.title) // Basic comparison
      .concat(oldItem ? [oldItem] : []); 

    setEditingSelection(prev => ({
      ...prev,
      alternatives: updatedAlternatives,
    }));
    // Optionally close panel after selection, or keep it open for more swaps
    // setEditingSelection({ category: null, alternatives: [] }); 
  };

  const handleCloseEditPanel = () => {
    setEditingSelection({ category: null, alternatives: [] });
  };

  const handleCopyScript = async () => {
    if (!finalScriptText) return;
    
    try {
      await navigator.clipboard.writeText(finalScriptText);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000); // Reset after 2 seconds
    } catch (err) {
      console.error('Failed to copy script:', err);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = finalScriptText;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      } catch (fallbackErr) {
        console.error('Fallback copy failed:', fallbackErr);
      }
      document.body.removeChild(textArea);
    }
  };

  // Effect to load script if loadScriptId is present in URL
  useEffect(() => {
    const scriptIdToLoad = searchParams.get('loadScriptId');
    if (scriptIdToLoad && userProfile?.uid && !authLoading) { // Ensure auth is resolved and user is present
      console.log("Attempting to load script with ID:", scriptIdToLoad);
      setIsLoading(true); // Use a general loading state or a specific one for script loading
      getScriptById(userProfile.uid, scriptIdToLoad)
        .then(scriptData => {
          if (scriptData) {
            setVideoIdea(scriptData.videoIdea || "");
            // Attempt to parse sources if they were stored as JSON string, otherwise expect object or handle error
            // For now, let's assume sources are not directly reloaded this way, focus on outline and final script
            // setSources(Array.isArray(scriptData.sources) ? scriptData.sources : []); 

            // Gemini summary might not be directly stored or reloaded, regenerate if needed or skip
            // setGeminiSummary(scriptData.geminiSummary || ""); 

            setScriptComponents(scriptData.selectedScriptItems || {}); // Assuming scriptComponents are the selected items
            setSelectedScriptItems(scriptData.selectedScriptItems || {});
            setFinalScriptText(scriptData.finalScriptText || "");
            setCurrentScriptId(scriptData.id || null);
            
            setWorkflowStarted(true);
            // Decide which tab to make active, e.g., final version if script text exists
            if (scriptData.finalScriptText) {
              setActiveTab("final-version");
            } else if (Object.keys(scriptData.selectedScriptItems || {}).length > 0) {
              setActiveTab("outline");
            } else {
              setActiveTab("sources"); // Or some other default
            }
            console.log("Script loaded successfully:", scriptData);
            // Remove the query parameter from the URL without reloading the page
            router.replace('/', { scroll: false }); 
          } else {
            console.warn("Script not found or failed to load:", scriptIdToLoad);
            // Optionally, show a notification to the user
             router.replace('/', { scroll: false }); // Also clear if not found
          }
        })
        .catch(error => {
          console.error("Error loading script:", error);
          // Optionally, show an error notification
           router.replace('/', { scroll: false }); // Clear on error too
        })
        .finally(() => {
          setIsLoading(false); // Reset general loading state
        });
    }
  }, [searchParams, userProfile, authLoading, router]); // Add router to dependencies

  // Debounced save function
  useEffect(() => {
    if (finalScriptText && workflowStarted && userProfile?.uid) {
      if (saveTimeoutId) {
        clearTimeout(saveTimeoutId);
      }
      const newTimeoutId = setTimeout(async () => {
        setIsSaving(true);
        console.log("Autosaving script...");
        try {
          const scriptDataToSave = {
            title: videoIdea || "Untitled Script",
            videoIdea: videoIdea || "",
            finalScriptText,
            selectedScriptItems: selectedScriptItems || {},
          };
          const savedId = await saveScript(userProfile.uid, currentScriptId, scriptDataToSave);
          if (!currentScriptId) {
            setCurrentScriptId(savedId);
          }
          console.log("Script autosaved successfully with ID:", savedId);
        } catch (error) {
          console.error("Error autosaving script:", error);
        }
        setIsSaving(false);
      }, 2500);
      setSaveTimeoutId(newTimeoutId);
    }

    return () => {
      if (saveTimeoutId) {
        clearTimeout(saveTimeoutId);
      }
    };
  }, [finalScriptText, videoIdea, selectedScriptItems, userProfile, currentScriptId, workflowStarted, saveTimeoutId]); // Added saveTimeoutId for cleanup logic


  // Reset script ID when starting a new workflow / clearing video idea
  useEffect(() => {
    if (!videoIdea && !workflowStarted) {
      setCurrentScriptId(null);
      setFinalScriptText(""); // Clear final script as well
      setCurrentWorkflowStep("init"); // Reset workflow step
      setWorkflowErrorStep(null); // Reset error step
      // console.log("New workflow, resetting script ID and final text.");
    }
  }, [videoIdea, workflowStarted]);

  if (authLoading) {
    return (
      <div className="bg-background text-foreground flex flex-col items-center p-4 w-full min-h-screen">
        <div className="w-full max-w-4xl text-center space-y-8">
          <StylishHeadline firstName={null} />
          <p className="text-muted-foreground">Loading page content...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background text-foreground flex flex-col items-center p-4 w-full min-h-screen">
      <div className={`w-full max-w-6xl px-4 mx-auto ${workflowStarted ? 'pt-8 pb-16 space-y-6' : 'pt-4 pb-8 space-y-6'}`}>
        
        {!workflowStarted && (
          <div className="flex flex-col items-center space-y-4">
            <StylishHeadline firstName={firstName} />
            <StandardizedInputGroup
              value={videoIdea}
              onChange={(e) => setVideoIdea(e.target.value)}
              onButtonClick={handleFindSources}
              isButtonLoading={isLoading}
              isButtonDisabled={!videoIdea.trim()}
              inputType={inputType}
              onInputTypeChange={setInputType}
              sourceOption={sourceOption}
              onSourceOptionChange={setSourceOption}
            />
          </div>
        )}

        {workflowStarted && (
          <>
            <div className="mb-6 flex justify-center">
              <h2 className="text-3xl font-semibold text-foreground truncate text-center w-[700px]">
                {videoIdea}
              </h2>
            </div>
            <FlowbiteTabs 
              activeTab={activeTab} 
              onTabChange={setActiveTab} 
              tabs={tabs}
            >
              <WorkflowActionBar
                activeTab={activeTab}
                onGenerateOutline={handleGenerateOutline}
                onProceedToFinalScript={handleProceedToFinalScript}
                isLoadingOutline={isGeneratingOutline}
                canGenerateOutline={canGenerateOutline}
                canProceedToFinalScript={canProceedToFinalScript}
                sourceCount={sources.length}
              />

              <TabContent value="tasks" activeTab={activeTab}>
                <div className="max-w-4xl mx-auto">
                  <ThinkingTimeline 
                    isProcessing={isLoading || isGeneratingOutline}
                    currentStep={currentWorkflowStep}
                    errorStep={workflowErrorStep}
                  />
                </div>
              </TabContent>

              <TabContent value="sources" activeTab={activeTab}>
                {isGeneratingOutline && outlineProgress && !outlineError && (
                  <div className="mt-4 p-3 border rounded-md bg-primary/10 text-primary max-w-xl mx-auto">
                    <p className="text-sm">{outlineProgress}</p>
                  </div>
                )}
                {outlineError && (
                  <div className="mt-4 p-3 border rounded-md bg-destructive/10 text-destructive-foreground max-w-xl mx-auto text-left">
                    <h4 className="font-semibold mb-1">Outline Generation Error:</h4>
                    <p className="text-sm whitespace-pre-wrap">{outlineError}</p>
                  </div>
                )}
                {isLoading && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4">
                    {[...Array(sourceOption === '1x' ? 1 : 9)].map((_, i) => <CardSkeleton key={`skel-${i}`} />)}
                  </div>
                )}
                {apiResponse && apiResponse.status !== 'network_error' && apiResponse.data && apiResponse.data.error && (
                  <div className="mt-6 p-4 border rounded-md bg-destructive/10 text-destructive-foreground max-w-xl mx-auto text-left">
                    <h3 className="font-semibold mb-2">Error:</h3>
                    <p className="text-sm">{apiResponse.data.error}</p>
                    {apiResponse.data.logs && (
                      <>
                        <h4 className="font-semibold mt-3 mb-1 text-xs">Error Logs:</h4>
                        <ul className="text-xs list-disc list-inside max-h-32 overflow-y-auto">
                          {apiResponse.data.logs.map((log, index) => (
                            <li key={index}>{log}</li>
                          ))}
                        </ul>
                      </>
                    )}
                  </div>
                )}

                {sources.length > 0 && !isLoading && (
                  <div className="mt-6 space-y-4">
                    <h3 className="text-xl font-bold text-center mb-4">Found Sources ({sources.length})</h3>
                     {/* Carousel for top 3-4 sources - to be implemented if desired */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {sources.map((source, index) => {
                        const cardData = {
                          user: {
                            name: getHostname(source.link),
                            avatarUrl: `https://www.google.com/s2/favicons?domain=${getHostname(source.link)}&sz=32`, // Favicon
                            profileUrl: source.link,
                          },
                          entities: [
                            { type: "text", text: `<strong>${source.title}</strong><br />${source.snippet}` },
                          ],
                          sourceUrl: source.link,
                          // createdAt: can be added if available from API
                        };
                        return <GenericCard key={`source-card-${index}`} contentData={cardData} className="shadow-2xl" />;
                      })}
                    </div>
                  </div>
                )}
                {apiResponse && apiResponse.status === 'network_error' && (
                  <div className="mt-6 p-4 border rounded-md bg-destructive/10 text-destructive-foreground max-w-xl mx-auto text-left">
                    <h3 className="font-semibold mb-2">Network Error:</h3>
                    <p className="text-sm">{apiResponse.data.error}</p>
                  </div>
                )}
                 {!isLoading && sources.length === 0 && apiResponse && apiResponse.status !== 'network_error' && !apiResponse.data.error && (
                  <div className="mt-6 p-4 border rounded-md bg-muted/50 max-w-xl mx-auto text-center">
                    <h3 className="font-semibold mb-2">No Sources Found</h3>
                    <p className="text-sm">Could not find any sources for your idea. Try a different query.</p>
                  </div>
                )}
              </TabContent>

              <TabContent value="outlines" activeTab={activeTab}>
                <div className="flex flex-row gap-4">
                  {/* Main selected items area */}
                  <div className={`flex-grow ${editingSelection.category ? 'w-2/3' : 'w-full'} transition-all duration-300 ease-in-out`}>
                    {Object.keys(selectedScriptItems).length > 0 && (
                      <div className="p-4 border rounded-md bg-muted/50 max-w-4xl mx-auto text-left">
                        <h3 className="font-bold mb-4 text-center">Selected Script Outline</h3>
                        {/* Display selected Hook */}
                        {selectedScriptItems.hook && (
                          <div className="mb-6">
                            <h4 className="font-bold text-primary mb-3">Hook:</h4>
                            <div 
                              className="p-3 bg-background rounded border-l-4 border-primary cursor-pointer hover:shadow-lg transition-shadow"
                              onClick={() => handleEditRequest('Hook')}
                            >
                              <h5 className="font-semibold text-sm mb-2">{selectedScriptItems.hook.title}</h5>
                              <ul className="text-xs font-normal space-y-1">
                                {selectedScriptItems.hook.lines.map((line, lineIndex) => (
                                  <li key={`selected-hook-line-${lineIndex}`}>• {line}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        )}
                        {/* Display selected Factset - assuming one for now, might need multiple later */}
                        {selectedScriptItems.factset && (
                          <div className="mb-6">
                            <h4 className="font-bold text-primary mb-3">Script Component:</h4>
                            <div 
                              className="p-3 bg-background rounded border-l-4 border-secondary cursor-pointer hover:shadow-lg transition-shadow"
                              onClick={() => handleEditRequest('Factset')}
                            >
                              <h5 className="font-semibold text-sm mb-2">{selectedScriptItems.factset.category}</h5>
                              <p className="text-xs font-normal">{selectedScriptItems.factset.content}</p>
                            </div>
                          </div>
                        )}
                        {/* Display selected Outro */}
                        {selectedScriptItems.outro && (
                          <div className="mb-6">
                            <h4 className="font-bold text-primary mb-3">Call to Action:</h4>
                            <div 
                              className="p-3 bg-background rounded border-l-4 border-accent cursor-pointer hover:shadow-lg transition-shadow"
                              onClick={() => handleEditRequest('Outro')}
                            >
                              <h5 className="font-semibold text-sm mb-2">{selectedScriptItems.outro.title}</h5>
                              <ul className="text-xs font-normal space-y-1">
                                {selectedScriptItems.outro.lines.map((line, lineIndex) => (
                                  <li key={`selected-outro-line-${lineIndex}`}>• {line}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        )}
                        {/* Display selected Take - assuming one for now */}
                        {selectedScriptItems.take && (
                          <div className="mb-6">
                            <h4 className="font-bold text-primary mb-3">Insight:</h4>
                            <div 
                              className="p-3 bg-background rounded border-l-4 border-muted cursor-pointer hover:shadow-lg transition-shadow"
                              onClick={() => handleEditRequest('Take')}
                            >
                              <h5 className="font-semibold text-sm mb-2">{selectedScriptItems.take.perspective}</h5>
                              <p className="text-xs font-normal">{selectedScriptItems.take.content}</p>
                            </div>
                          </div>
                        )}
                        
                        {/* This button functionality might change based on the new slide-over panel */}
                        <div className="text-center mt-6">
                          <ActionButton 
                            onClick={() => setActiveTab("final")} // Or onProceedToFinalScript from WorkflowActionBar
                            icon={PenTool}
                            className="bg-secondary hover:bg-secondary/90 text-secondary-foreground"
                            disabled={!canProceedToFinalScript} // Use the prop passed to WorkflowActionBar or directly from state
                          >
                            Proceed to Final Script
                          </ActionButton>
                        </div>
                      </div>
                    )}
                    {/* Fallback or loading state for outlines if needed */}
                    {!Object.keys(selectedScriptItems).length > 0 && isGeneratingOutline && (
                      <div className="p-4 text-center">
                        <p className="text-muted-foreground">Generating outline components...</p>
                      </div>
                    )}
                     {!Object.keys(selectedScriptItems).length > 0 && !isGeneratingOutline && scriptComponents && (
                      <div className="p-4 text-center">
                        <p className="text-muted-foreground">No outline components to display. Something might have gone wrong or structure is unexpected.</p>
                      </div>
                    )}
                  </div>

                  {/* Alternative Selection Panel Area */}
                  {editingSelection.category && (
                    <div className="w-1/3 transition-all duration-300 ease-in-out">
                      <AlternativeSelectionPanel
                        categoryTitle={editingSelection.category}
                        items={editingSelection.alternatives}
                        onSelectItem={handleSelectItemFromPanel}
                        onClosePanel={handleCloseEditPanel}
                        className="h-[calc(100vh-250px)]" // Example height, adjust as needed
                      />
                    </div>
                  )}
                </div>
              </TabContent>

              <TabContent value="final" activeTab={activeTab}>
                <div className="p-4 border rounded-md bg-muted/50 max-w-6xl mx-auto text-left flex gap-4 h-[calc(100vh-200px)]">
                  {/* Left Side: Scrollable Textarea Container */}
                  <div className="flex-grow w-2/3 flex flex-col">
                    <h3 className="font-bold mb-4 text-center flex-shrink-0">Final Script</h3>
                    <div className="flex-1 overflow-y-auto">
                      <textarea
                        className="w-full min-h-[1000px] p-3 border rounded-md bg-background text-foreground focus:ring-primary focus:border-primary resize-none"
                        placeholder="Final script will appear here..."
                        value={finalScriptText}
                        readOnly // Still readOnly for now
                        style={{
                          height: Math.max(1000, (finalScriptText.split('\n').length * 24) + 50) + 'px'
                        }}
                      />
                    </div>
                  </div>

                  {/* Right Side: Static Sidebar */}
                  <div className="w-1/3 space-y-4 pl-4 border-l flex-shrink-0 overflow-y-auto">
                    <h4 className="text-lg font-semibold mb-3 text-center">Script Controls</h4>

                    {/* Tone of Voice Dropdown */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="w-full justify-between">
                          Tone of Voice <ChevronDown className="ml-2 h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-56">
                        <DropdownMenuLabel>Select Tone</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>Professional</DropdownMenuItem>
                        <DropdownMenuItem>Casual</DropdownMenuItem>
                        <DropdownMenuItem>Enthusiastic</DropdownMenuItem>
                        <DropdownMenuItem>Humorous</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>

                    {/* Ask for Custom Changes Dropdown */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="w-full justify-between">
                          Custom Changes <ChevronDown className="ml-2 h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-56">
                        <DropdownMenuLabel>Request Edit</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>Shorten Section</DropdownMenuItem>
                        <DropdownMenuItem>Expand on Point</DropdownMenuItem>
                        <DropdownMenuItem>Change CTA</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>

                    {/* Restore Previous Version Dropdown */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="w-full justify-between" disabled>
                          Version History <ChevronDown className="ml-2 h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-56">
                        <DropdownMenuLabel>Restore Version</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem disabled>(Versioning coming soon)</DropdownMenuItem>
                        {/* <DropdownMenuItem disabled>Version 2 (Current)</DropdownMenuItem> */}
                        {/* <DropdownMenuItem disabled>Version 1</DropdownMenuItem> */}
                      </DropdownMenuContent>
                    </DropdownMenu>
                    
                    <DropdownMenuSeparator />

                    {/* One-Click Changes Section */}
                    <div>
                      <h5 className="text-md font-semibold mb-2">One-Click Changes</h5>
                      <Button variant="secondary" className="w-full" disabled>
                        <Sparkles className="mr-2 h-4 w-4" /> Humanize Script
                      </Button>
                    </div>

                    {/* Copy and Download Buttons */}
                    <div className="space-y-2">
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={handleCopyScript}
                        disabled={!finalScriptText}
                      >
                        <Copy className="mr-2 h-4 w-4" /> 
                        {copySuccess ? "Copied!" : "Copy Script"}
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => {
                          if (!finalScriptText) return;
                          const blob = new Blob([finalScriptText], { type: 'text/plain' });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = `${videoIdea || 'script'}.txt`;
                          document.body.appendChild(a);
                          a.click();
                          document.body.removeChild(a);
                          URL.revokeObjectURL(url);
                        }}
                        disabled={!finalScriptText}
                      >
                        <Download className="mr-2 h-4 w-4" /> Download Script
                      </Button>
                    </div>
                    
                    {isSaving && <p className="text-xs text-muted-foreground text-center mt-2">Saving script...</p>}
                    {copySuccess && <p className="text-xs text-green-600 text-center mt-2">Script copied to clipboard!</p>}

                  </div>
                </div>
              </TabContent>
            </FlowbiteTabs>
          </>
        )}
        
        {/* Conditionally render Learn & Explore, Recent Scripts etc. only if workflow NOT started */}
        {!workflowStarted && (
          <>
            <div className={`space-y-8 mt-8`}>
              <h2 className="text-2xl font-bold text-foreground text-center">Learn & Explore</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <ContentCard 
                  title="Script Writing Overview"
                  description="Learn the fundamentals of effective script writing and storytelling techniques"
                  badge="Guide"
                />
                <ContentCard 
                  title="Application Tips"
                  description="Best practices and tips for using our script writing tools effectively"
                  badge="Tips"
                />
                <ContentCard 
                  title="Quick Start Guide"
                  description="Get up and running quickly with our step-by-step tutorial"
                  badge="Tutorial"
                />
              </div>
            </div>

            <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <RecentScripts />
              </div>
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl">Notifications</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Alert>
                      <AlertDescription>
                        Welcome to your new Create page! Start by entering a video idea above.
                      </AlertDescription>
                    </Alert>
                    <Alert>
                      <AlertDescription>
                        New feature: AI-powered script analysis is now available in the Pro plan.
                      </AlertDescription>
                    </Alert>
                  </CardContent>
                </Card>
              </div>
            </div>

            <div className="pt-8 text-center">
              <p className="text-xs text-muted-foreground">
                Ensure your idea is clear and concise for the best results.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  )
} 