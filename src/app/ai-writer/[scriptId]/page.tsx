"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import React, { useContext, useState, useEffect } from "react";
import { IconFileSearch, IconListDetails, IconFileText } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Copy, Edit, ArrowLeft } from "lucide-react";
import { Suspense } from "react";
import { ClientTweetCard } from "@/components/magicui/client-tweet-card";
import { TweetSkeleton } from "@/components/magicui/tweet-card";
import { useAiWriterContext } from "@/contexts/AiWriterContext";
import type { Source } from "@/contexts/AiWriterContext";
import ThinkingTimeline from "@/components/interactive/ThinkingTimeline";
import type { ScriptHook, ScriptFactset, ScriptTake, ScriptOutro } from "@/lib/types/scriptComponents";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { getScriptById } from '@/lib/firestoreService';
import { AuthContext } from '@/contexts/AuthContext';

// Component definitions should come before they are used in ScriptPageContent

// TruncatedTitleHeader component
interface TruncatedTitleHeaderProps {
  title: string;
  onBack: () => void;
}

const TruncatedTitleHeader: React.FC<TruncatedTitleHeaderProps> = ({ title, onBack }) => {
  const [showCopyFeedback, setShowCopyFeedback] = useState(false);

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(title).then(() => {
      setShowCopyFeedback(true);
      setTimeout(() => setShowCopyFeedback(false), 2000);
    }).catch(err => {
      console.error("Failed to copy title: ", err);
      alert("Failed to copy title.");
    });
  };

  return (
    <div id="script-header" className="max-w-4xl mx-auto relative isolate z-20 sticky-header">
      <div className="relative z-10 header-content-wrapper">
        <div className="pt-3 group relative flex items-end gap-2 title-and-actions-container">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onBack}
            className="mr-2 hover:bg-muted/50"
          >
            <ArrowLeft size={16} className="mr-1" />
            Back
          </Button>
          <div className="min-w-0 flex-1 title-container h-28">
            <TooltipProvider delayDuration={300}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <h1 className="font-display text-pretty text-lg lg:text-2xl font-semibold dark:font-medium text-textMain dark:text-textMainDark selection:bg-super/50 selection:text-textMain dark:selection:bg-superDuper/10 dark:selection:text-superDark break-words text-left overflow-hidden line-clamp-3">
                    {title}
                  </h1>
                </TooltipTrigger>
                <TooltipContent side="bottom" align="start" className="max-w-md">
                  <p className="text-sm">{title}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className="flex shrink-0 self-end actions-container mb-1">
            <div className="relative flex shrink-0 flex-row rounded-lg border border-border/50 bg-background shadow-sm p-[1.5px] opacity-0 group-hover:opacity-100 transition-opacity duration-150">
              <Button
                aria-label="Edit Title"
                variant="ghost"
                size="icon"
                className="h-7 w-7 hover:bg-muted/50 text-muted-foreground"
                onClick={() => alert("Edit functionality not implemented yet.")}
              >
                <Edit size={14} />
              </Button>
              <div className="m-[1.5px] w-px border-r border-borderMain/50 bg-transparent"></div>
              <TooltipProvider delayDuration={0}>
                <Tooltip open={showCopyFeedback}>
                  <TooltipTrigger asChild>
                    <Button
                      aria-label="Copy Title"
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 hover:bg-muted/50 text-muted-foreground"
                      onClick={handleCopyToClipboard}
                    >
                      <Copy size={14} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="bg-green-600 text-white">
                    <p>Copied!</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// tabsData and ScriptTabs component structure
const tabsData = [
  { name: "Research", value: "research", icon: IconFileSearch },
  { name: "Outline", value: "outline", icon: IconListDetails },
  { name: "Script", value: "script", icon: IconFileText },
];

const ScriptTabs = () => {
  const contextValues = useAiWriterContext();
  console.log("[ScriptTabs] Rendering. Context state - isProcessing:", contextValues.isProcessing, "currentStep:", contextValues.currentStep, "processingError:", contextValues.processingError);

  const {
    sources,
    isProcessing: isResearchProcessing,
    currentStep: researchCurrentStep,
    errorStep: researchErrorStep,
    processingError: researchProcessingError,
    videoIdea,
    scriptComponents,
    isLoadingScriptComponents,
    scriptComponentsError,
    userSelectedComponents,
    analyzeAndGenerateOutlines,
    updateSelectedHook,
    updateSelectedBridge,
    updateSelectedGoldenNugget,
    updateSelectedWTA,
    finalScript,
    isLoadingFinalScript,
    finalScriptError,
    generateFinalScript
  } = contextValues;

  const handleGenerateOutline = () => {
    if (sources && sources.length > 0 && videoIdea) {
      analyzeAndGenerateOutlines();
    } else {
      console.warn("Cannot generate outline: Video idea or sources are missing.");
      alert("Please ensure a video idea has been searched and sources are available in the 'Research' tab before generating an outline.");
    }
  };

  const handleGenerateFinalScript = () => {
    if (userSelectedComponents && 
        userSelectedComponents.hook && 
        userSelectedComponents.bridge && 
        userSelectedComponents.goldenNugget && 
        userSelectedComponents.wta) {
      generateFinalScript();
    } else {
      alert("Please select a hook, bridge, golden nugget, and WTA from the Outline tab first.");
    }
  };

  const copyScriptToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      alert("Script copied to clipboard!");
    }).catch(err => {
      console.error("Failed to copy script: ", err);
      alert("Failed to copy script.");
    });
  };

  const renderOutlineContent = () => {
    if (isLoadingScriptComponents) {
      return <p className="text-center p-4">Generating script outline ideas...</p>;
    }
    if (scriptComponentsError) {
      return (
        <div className="text-red-500 p-4 border border-red-500 rounded-md">
          <h3 className="font-semibold">Error generating outline:</h3>
          <p>{scriptComponentsError}</p>
          <Button onClick={handleGenerateOutline} className="mt-4">Retry Generating Outline</Button>
        </div>
      );
    }
    if (!scriptComponents) {
      return (
        <div className="text-center p-4">
          <p className="mb-4 text-muted-foreground">
            Once research sources are available, you can generate script outline components here.
          </p>
          {(sources && sources.length > 0 && videoIdea) ? (
            <Button onClick={handleGenerateOutline} disabled={isLoadingScriptComponents}>
              {isLoadingScriptComponents ? "Generating..." : "Generate Script Outline"}
            </Button>
          ) : (
            <p className="text-sm text-orange-500">Please ensure a video idea has been searched and sources are available in the &apos;Research&apos; tab.</p>
          )}
        </div>
      );
    }

    return (
      <div className="space-y-8">
        <section>
          <h4 className="text-xl font-semibold mb-3 border-b pb-2">Pick Your Hook:</h4>
          {scriptComponents.hooks && scriptComponents.hooks.length > 0 ? (
            <RadioGroup 
              value={userSelectedComponents?.hook?.title || ""} 
              onValueChange={(title: string) => {
                  const selected = scriptComponents.hooks.find(h => h.title === title);
                  updateSelectedHook(selected || null);
              }}
            >
              {scriptComponents.hooks.map((hook, index) => (
                <div key={`hook-${index}`} className="mb-3 p-3 border rounded-lg shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value={hook.title} id={`hook-${hook.title}-${index}`} />
                    <Label htmlFor={`hook-${hook.title}-${index}`} className="font-medium text-md cursor-pointer">
                      {hook.title}
                    </Label>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1 pl-6">{hook.lines.join(" ")}</p>
                </div>
              ))}
            </RadioGroup>
          ) : <p className="text-sm text-muted-foreground">No Hook options generated.</p>}
        </section>

        <section>
          <h4 className="text-xl font-semibold mb-3 border-b pb-2">Select Your Bridge:</h4>
          {scriptComponents.bridges && scriptComponents.bridges.length > 0 ? (
            <RadioGroup
              value={userSelectedComponents?.bridge?.title || ""}
              onValueChange={(title: string) => {
                const selected = scriptComponents.bridges.find(b => b.title === title);
                updateSelectedBridge(selected || null);
              }}
            >
              {scriptComponents.bridges.map((bridge, index) => (
                <div key={`bridge-${index}`} className="mb-3 p-3 border rounded-lg shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value={bridge.title} id={`bridge-${index}`} />
                    <Label htmlFor={`bridge-${index}`} className="font-medium text-md cursor-pointer">
                      {bridge.title}
                    </Label>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1 pl-6">{bridge.content}</p>
                </div>
              ))}
            </RadioGroup>
          ) : <p className="text-sm text-muted-foreground">No Bridge options generated.</p>}
        </section>

        <section>
          <h4 className="text-xl font-semibold mb-3 border-b pb-2">Select Your Golden Nugget:</h4>
          {scriptComponents.goldenNuggets && scriptComponents.goldenNuggets.length > 0 ? (
            <RadioGroup
              value={userSelectedComponents?.goldenNugget?.title || ""}
              onValueChange={(title: string) => {
                const selected = scriptComponents.goldenNuggets.find(gn => gn.title === title);
                updateSelectedGoldenNugget(selected || null);
              }}
            >
              {scriptComponents.goldenNuggets.map((goldenNugget, index) => (
                <div key={`goldennugget-${index}`} className="mb-3 p-3 border rounded-lg shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value={goldenNugget.title} id={`goldennugget-${index}`} />
                    <Label htmlFor={`goldennugget-${index}`} className="font-medium text-md cursor-pointer">
                      {goldenNugget.title}
                    </Label>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1 pl-6">{goldenNugget.content}</p>
                </div>
              ))}
            </RadioGroup>
          ) : <p className="text-sm text-muted-foreground">No Golden Nugget options generated.</p>}
        </section>

        <section>
          <h4 className="text-xl font-semibold mb-3 border-b pb-2">Pick Your WTA (Why to Act):</h4>
          {scriptComponents.wtas && scriptComponents.wtas.length > 0 ? (
            <RadioGroup 
              value={userSelectedComponents?.wta?.title || ""} 
              onValueChange={(title: string) => {
                  const selected = scriptComponents.wtas.find(w => w.title === title);
                  updateSelectedWTA(selected || null);
              }}
            >
              {scriptComponents.wtas.map((wta, index) => (
                <div key={`wta-${index}`} className="mb-3 p-3 border rounded-lg shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value={wta.title} id={`wta-${wta.title}-${index}`} />
                    <Label htmlFor={`wta-${wta.title}-${index}`} className="font-medium text-md cursor-pointer">
                      {wta.title}
                    </Label>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1 pl-6">{wta.lines.join(" ")}</p>
                </div>
              ))}
            </RadioGroup>
          ) : <p className="text-sm text-muted-foreground">No WTA options generated.</p>}
        </section>
      </div>
    );
  };

  const renderScriptContent = () => {
    const canGenerateScript = userSelectedComponents && 
                              userSelectedComponents.hook && 
                              userSelectedComponents.bridge && 
                              userSelectedComponents.goldenNugget && 
                              userSelectedComponents.wta;

    if (isLoadingFinalScript) {
      return <p className="text-center p-4">Generating your final script...</p>;
    }
    if (finalScriptError) {
      return (
        <div className="text-red-500 p-4 border border-red-500 rounded-md">
          <h3 className="font-semibold">Error generating final script:</h3>
          <p>{finalScriptError}</p>
          {canGenerateScript && 
            <Button onClick={handleGenerateFinalScript} className="mt-4">Retry Generating Script</Button>
          }
        </div>
      );
    }
    if (finalScript) {
      return (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold">Your Generated Script:</h3>
            <Button onClick={() => copyScriptToClipboard(finalScript)} variant="outline">
              <Copy className="mr-2 h-4 w-4" /> Copy Script
            </Button>
          </div>
          <pre className="bg-muted p-4 rounded-md whitespace-pre-wrap font-sans text-sm leading-relaxed">{finalScript}</pre>
        </div>
      );
    }
    return (
      <div className="text-center p-4">
        <p className="mb-4 text-muted-foreground">
          Once you have selected your script components from the &quot;Outline&quot; tab, you can generate the final script here.
        </p>
        <Button onClick={handleGenerateFinalScript} disabled={!canGenerateScript || isLoadingFinalScript}>
          {isLoadingFinalScript ? "Generating..." : "Generate Final Script"}
        </Button>
        {!canGenerateScript && 
            <p className="text-xs text-orange-500 mt-2">Please select a hook, bridge, golden nugget, and WTA from the &quot;Outline&quot; tab first.</p>
        }
      </div>
    );
  };

  return (
    <Tabs defaultValue={tabsData[0].value} className="w-full">
      <TabsList className="w-full p-0 bg-background justify-start border-b rounded-none">
        {tabsData.map((tab) => (
          <TabsTrigger
            key={tab.value}
            value={tab.value}
            className="rounded-none bg-background h-full data-[state=active]:shadow-none border-b-4 border-transparent data-[state=active]:border-primary px-4 py-2.5"
          >
            <tab.icon className="tabler-icon mr-2 h-4 w-4 shrink-0" />
            <code className="text-sm font-poppins">{tab.name}</code>
          </TabsTrigger>
        ))}
      </TabsList>
      {tabsData.map((tab) => (
        <TabsContent key={tab.value} value={tab.value} className="pt-6">
          {tab.value === "research" ? (
            isResearchProcessing ? (
              <ThinkingTimeline isProcessing={isResearchProcessing} currentStep={researchCurrentStep} errorStep={researchErrorStep} />
            ) : researchProcessingError ? (
              <div className="text-red-500 p-4 border border-red-500 rounded-md">
                <h3 className="font-semibold">Error during research processing:</h3>
                <p>{researchProcessingError}</p>
              </div>
            ) : sources && sources.length > 0 ? (
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Research Sources</h3>
                {sources.some(source => source.id === 'voice-transcript') ? (
                  <div className="space-y-4">
                    {sources.map((source: Source, index: number) => {
                      if (source.id === 'voice-transcript') {
                        return (
                          <div key={source.id} className="p-4 border rounded-lg bg-muted/20">
                            <div className="flex items-center gap-2 mb-3">
                              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                              <h4 className="font-medium">Your Voice Note Transcript</h4>
                            </div>
                            <div className="bg-background p-3 rounded border max-h-60 overflow-y-auto">
                              <p className="text-sm leading-relaxed whitespace-pre-wrap">
                                {source.extractedText}
                              </p>
                            </div>
                            <p className="text-xs text-muted-foreground mt-2">
                              This transcript was generated from your voice recording and is being used to create outline components.
                            </p>
                          </div>
                        );
                      } else {
                        // Regular source display
                        const tweetData = {
                          id: source.id || `source-${index}`,
                          user: {
                            name: "Research Source",
                            handle: new URL(source.link).hostname,
                            verified: false,
                          },
                          text: source.title + (source.snippet ? `\n\nSnippet: ${source.snippet}` : ""),
                          url: source.link,
                          analyzed: false,
                        };
                        return (
                          <Suspense key={tweetData.id} fallback={<TweetSkeleton />}>
                            <ClientTweetCard
                              tweet={tweetData}
                              onError={(error: Error) => console.error("Tweet card error:", error)}
                            />
                          </Suspense>
                        );
                      }
                    })}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {sources.map((source: Source, index: number) => {
                      const tweetData = {
                        id: source.id || `source-${index}`,
                        user: {
                          name: "Research Source",
                          handle: new URL(source.link).hostname,
                          verified: false,
                        },
                        text: source.title + (source.snippet ? `\n\nSnippet: ${source.snippet}` : ""),
                        url: source.link,
                        analyzed: false,
                      };
                      return (
                        <Suspense key={tweetData.id} fallback={<TweetSkeleton />}>
                          <ClientTweetCard
                            tweet={tweetData}
                            onError={(error: Error) => console.error("Tweet card error:", error)}
                          />
                        </Suspense>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center p-4 text-muted-foreground">
                <p>No sources found or AI Writer search not initiated for a video idea yet.</p>
                 {researchProcessingError && !isResearchProcessing && (
                  <div className="text-red-500 p-4 border border-red-500 rounded-md mt-4">
                    <h3 className="font-semibold">Error during research processing:</h3>
                    <p>{researchProcessingError}</p>
                  </div>
                )}
              </div>
            )
          ) : tab.value === "outline" ? (
            renderOutlineContent()
          ) : tab.value === "script" ? (
            renderScriptContent()
          ) : null }
        </TabsContent>
      ))}
    </Tabs>
  );
};

const ScriptPageContent = () => {
  const { 
    videoIdea, 
    setVideoIdea, 
    setScriptComponents, 
    setIsLoadingScriptComponents,
    setScriptComponentsError,
    setSources
  } = useAiWriterContext();
  const authContext = useContext(AuthContext);
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const scriptId = params?.scriptId as string;
  const shouldLoadScript = searchParams?.get('loadScript') === 'true';
  
  const [isLoadingScript, setIsLoadingScript] = useState(false);
  const [scriptLoadError, setScriptLoadError] = useState<string | null>(null);
  
  const ideaTitle = videoIdea || "Script Generation Session";

  // Load saved script and generate outline components
  useEffect(() => {
    if (shouldLoadScript && scriptId && authContext?.userProfile?.uid) {
      loadSavedScript();
    }
  }, [shouldLoadScript, scriptId, authContext?.userProfile?.uid]);

  const loadSavedScript = async () => {
    if (!authContext?.userProfile?.uid || !scriptId) return;
    
    setIsLoadingScript(true);
    setScriptLoadError(null);
    
    try {
      // Load the saved script
      const savedScript = await getScriptById(authContext.userProfile.uid, scriptId);
      
      if (!savedScript) {
        throw new Error('Script not found');
      }

      // Set video idea from the saved script
      setVideoIdea(savedScript.title || savedScript.videoIdea || 'Imported Script');

      // Extract hook and transcript from the saved script
      let existingHook = '';
      let transcript = '';

      // Check if this is a voice note script with selectedScriptItems
      const scriptItems = savedScript.selectedScriptItems as any;
      if (scriptItems?.voiceNote) {
        existingHook = scriptItems.voiceNote.hook || '';
        transcript = scriptItems.voiceNote.transcript || '';
      }
      
      // Fallback to finalScriptText if no voice note data
      if (!transcript && savedScript.finalScriptText) {
        transcript = savedScript.finalScriptText;
      }

      // Create a transcript source for the Research tab if we have transcript content
      if (transcript) {
        const transcriptSource = {
          id: 'voice-transcript',
          title: 'Your Voice Note Transcript',
          link: '#transcript',
          snippet: transcript.length > 200 ? transcript.substring(0, 200) + '...' : transcript,
          extractedText: transcript,
          isTextExtracted: true,
          textExtractionError: undefined
        };
        setSources([transcriptSource]);
      }

      // Generate outline components from existing content
      if (existingHook || transcript) {
        await generateOutlineFromScript(existingHook, transcript, savedScript.videoIdea);
      } else {
        setScriptComponentsError('No content found to generate outline from');
      }

    } catch (error: any) {
      console.error('Error loading saved script:', error);
      setScriptLoadError(error.message || 'Failed to load script');
    } finally {
      setIsLoadingScript(false);
    }
  };

  const generateOutlineFromScript = async (hook: string, transcript: string, videoIdea: string) => {
    setIsLoadingScriptComponents(true);
    setScriptComponentsError(null);
    
    try {
      const response = await fetch('/api/generate-outline-from-script', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          existingHook: hook,
          transcript: transcript,
          videoIdea: videoIdea
        }),
      });

      const result = await response.json();

      if (result.success) {
        setScriptComponents(result.scriptComponents);
      } else {
        throw new Error(result.error || 'Failed to generate outline components');
      }
    } catch (error: any) {
      console.error('Error generating outline from script:', error);
      setScriptComponentsError(error.message || 'Failed to generate outline components');
    } finally {
      setIsLoadingScriptComponents(false);
    }
  };

  const handleBack = () => {
    router.push('/my-scripts');
  };

  // Show loading state while loading saved script
  if (isLoadingScript) {
    return (
      <div className="flex flex-col w-full space-y-4 md:space-y-6 pb-12">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="h-8 w-8 animate-spin mx-auto mb-4 rounded-full border-2 border-primary border-t-transparent"></div>
            <p className="text-muted-foreground">Loading your script...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show error state if script loading failed
  if (scriptLoadError) {
    return (
      <div className="flex flex-col w-full space-y-4 md:space-y-6 pb-12">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <p className="text-destructive mb-4">Error: {scriptLoadError}</p>
            <button 
              onClick={handleBack}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              Back to Library
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full space-y-4 md:space-y-6 pb-12">
      <TruncatedTitleHeader title={ideaTitle} onBack={handleBack} />
      <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 md:space-y-8">
        <div className="w-full">
          <ScriptTabs />
        </div>
      </div>
    </div>
  );
};

export default function ScriptPage() {
  return <ScriptPageContent />;
} 