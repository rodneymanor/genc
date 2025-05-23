"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import React, { useContext, useState, useEffect } from "react";
import { IconFileSearch, IconListDetails, IconFileText } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Copy, Edit } from "lucide-react";
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Component definitions should come before they are used in AiWriterPageContent or AiWriterTabs

// New TruncatedTitleHeader component
interface TruncatedTitleHeaderProps {
  title: string;
}

const TruncatedTitleHeader: React.FC<TruncatedTitleHeaderProps> = ({ title }) => {
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
    <div id="ai-writer-header" className="max-w-4xl mx-auto relative isolate z-20 sticky-header">
      <div className="relative z-10 header-content-wrapper">
        <div className="pt-3 group relative flex items-end gap-2 title-and-actions-container">
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

// tabsData and AiWriterTabs component structure
const tabsData = [
  { name: "Research", value: "research", icon: IconFileSearch },
  { name: "Outline", value: "outline", icon: IconListDetails },
  { name: "Script", value: "script", icon: IconFileText },
];

const AiWriterTabs = () => {
  const contextValues = useAiWriterContext();
  console.log("[AiWriterTabs] Rendering. Context state - isProcessing:", contextValues.isProcessing, "currentStep:", contextValues.currentStep, "processingError:", contextValues.processingError);

  const {
    sources,
    isProcessing: isResearchProcessing, // Alias for clarity in this component
    currentStep: researchCurrentStep,    // Alias for clarity
    errorStep: researchErrorStep,        // Alias for clarity
    processingError: researchProcessingError,
    videoIdea,
    scriptComponents,
    isLoadingScriptComponents,
    scriptComponentsError,
    userSelectedComponents,
    analyzeAndGenerateOutlines,
    updateSelectedHook,
    updateSelectedFactsets,
    updateSelectedTake,
    updateSelectedOutro,
    finalScript,
    isLoadingFinalScript,
    finalScriptError,
    generateFinalScript
  } = contextValues; // Use the already fetched contextValues

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
        userSelectedComponents.factsets.length > 0 && 
        userSelectedComponents.take && 
        userSelectedComponents.outro) {
      generateFinalScript();
    } else {
      alert("Please select a hook, at least one factset, a take, and an outro from the Outline tab first.");
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
            <p className="text-sm text-orange-500">Please ensure a video idea has been searched and sources are available in the 'Research' tab.</p>
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
          {scriptComponents.factsets && scriptComponents.factsets.filter(f => f.category === 'Bridge').length > 0 ? (
            <RadioGroup
              value={userSelectedComponents?.factsets?.find(f => f.category === 'Bridge')?.content || ""}
              onValueChange={(content: string) => {
                const selected = scriptComponents.factsets.find(f => f.category === 'Bridge' && f.content === content);
                if (selected) updateSelectedFactsets(selected, true);
              }}
            >
              {scriptComponents.factsets.filter(f => f.category === 'Bridge').map((factset, index) => (
                <div key={`bridge-factset-${index}`} className="mb-3 p-3 border rounded-lg shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value={factset.content} id={`bridge-${index}`} />
                    <Label htmlFor={`bridge-${index}`} className="font-medium text-md cursor-pointer">
                      Option {index + 1}
                    </Label>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1 pl-6">{factset.content}</p>
                </div>
              ))}
            </RadioGroup>
          ) : <p className="text-sm text-muted-foreground">No Bridge options generated.</p>}
        </section>

        <section>
          <h4 className="text-xl font-semibold mb-3 border-b pb-2">Select Your Micro-Hook:</h4>
          {scriptComponents.factsets && scriptComponents.factsets.filter(f => f.category === 'MicroHook').length > 0 ? (
            <RadioGroup
              value={userSelectedComponents?.factsets?.find(f => f.category === 'MicroHook')?.content || ""}
              onValueChange={(content: string) => {
                const selected = scriptComponents.factsets.find(f => f.category === 'MicroHook' && f.content === content);
                if (selected) updateSelectedFactsets(selected, true);
              }}
            >
              {scriptComponents.factsets.filter(f => f.category === 'MicroHook').map((factset, index) => (
                <div key={`microhook-factset-${index}`} className="mb-3 p-3 border rounded-lg shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value={factset.content} id={`microhook-${index}`} />
                    <Label htmlFor={`microhook-${index}`} className="font-medium text-md cursor-pointer">
                       Option {index + 1}
                    </Label>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1 pl-6">{factset.content}</p>
                </div>
              ))}
            </RadioGroup>
          ) : <p className="text-sm text-muted-foreground">No Micro-Hook options generated.</p>}
        </section>

        <section>
          <h4 className="text-xl font-semibold mb-3 border-b pb-2">Select Your Golden Nugget:</h4>
          {scriptComponents.factsets && scriptComponents.factsets.filter(f => f.category === 'GoldenNugget').length > 0 ? (
            <RadioGroup
              value={userSelectedComponents?.factsets?.find(f => f.category === 'GoldenNugget')?.content || ""}
              onValueChange={(content: string) => {
                const selected = scriptComponents.factsets.find(f => f.category === 'GoldenNugget' && f.content === content);
                if (selected) updateSelectedFactsets(selected, true);
              }}
            >
              {scriptComponents.factsets.filter(f => f.category === 'GoldenNugget').map((factset, index) => (
                <div key={`goldennugget-factset-${index}`} className="mb-3 p-3 border rounded-lg shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value={factset.content} id={`goldennugget-${index}`} />
                    <Label htmlFor={`goldennugget-${index}`} className="font-medium text-md cursor-pointer">
                       Option {index + 1}
                    </Label>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1 pl-6">{factset.content}</p>
                </div>
              ))}
            </RadioGroup>
          ) : <p className="text-sm text-muted-foreground">No Golden Nugget options generated.</p>}
        </section>

        <section>
          <h4 className="text-xl font-semibold mb-3 border-b pb-2">Additional Insights (Factsets):</h4>
          {scriptComponents.factsets && scriptComponents.factsets.filter(f => !['Bridge', 'MicroHook', 'GoldenNugget'].includes(f.category)).length > 0 ? (
            <div className="space-y-3">
              {scriptComponents.factsets.filter(f => !['Bridge', 'MicroHook', 'GoldenNugget'].includes(f.category)).map((factset, index) => (
                <div key={`other-factset-${index}`} className="flex items-start space-x-3 p-3 border rounded-lg shadow-sm hover:shadow-md transition-shadow">
                  <Checkbox 
                    id={`other-factset-${factset.category}-${index}`}
                    checked={userSelectedComponents?.factsets?.some(f => f.content === factset.content && f.category === factset.category)}
                    onCheckedChange={(checked: boolean | 'indeterminate') => {
                      updateSelectedFactsets(factset, !!checked);
                    }}
                    className="mt-1"
                  />
                  <div className="grid gap-1.5 leading-snug">
                    <Label htmlFor={`other-factset-${factset.category}-${index}`} className="font-medium text-md cursor-pointer">
                      {factset.category} (Insight {index + 1})
                    </Label>
                    <p className="text-sm text-muted-foreground">{factset.content}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : <p className="text-sm text-muted-foreground">No additional insights/factsets generated.</p>}
        </section>

        <section>
          <h4 className="text-xl font-semibold mb-3 border-b pb-2">Pick Your Take:</h4>
          {scriptComponents.takes && scriptComponents.takes.length > 0 ? (
            <RadioGroup 
              value={userSelectedComponents?.take?.perspective || ""} 
              onValueChange={(perspective: string) => {
                  const selected = scriptComponents.takes.find(t => t.perspective === perspective);
                  updateSelectedTake(selected || null);
              }}
            >
              {scriptComponents.takes.map((take, index) => (
                <div key={`take-${index}`} className="mb-3 p-3 border rounded-lg shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value={take.perspective} id={`take-${take.perspective}-${index}`} />
                    <Label htmlFor={`take-${take.perspective}-${index}`} className="font-medium text-md cursor-pointer">
                      {take.perspective}
                    </Label>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1 pl-6">{take.content}</p>
                </div>
              ))}
            </RadioGroup>
          ) : <p className="text-sm text-muted-foreground">No Take options generated.</p>}
        </section>

        <section>
          <h4 className="text-xl font-semibold mb-3 border-b pb-2">Pick Your Outro (WTA - Why to Act):</h4>
          {scriptComponents.outros && scriptComponents.outros.length > 0 ? (
            <RadioGroup 
              value={userSelectedComponents?.outro?.title || ""} 
              onValueChange={(title: string) => {
                  const selected = scriptComponents.outros.find(o => o.title === title);
                  updateSelectedOutro(selected || null);
              }}
            >
              {scriptComponents.outros.map((outro, index) => (
                <div key={`outro-${index}`} className="mb-3 p-3 border rounded-lg shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value={outro.title} id={`outro-${outro.title}-${index}`} />
                    <Label htmlFor={`outro-${outro.title}-${index}`} className="font-medium text-md cursor-pointer">
                      {outro.title}
                    </Label>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1 pl-6">{outro.lines.join(" ")}</p>
                </div>
              ))}
            </RadioGroup>
          ) : <p className="text-sm text-muted-foreground">No Outro (WTA) options generated.</p>}
        </section>
        </div>
    );
  };

  const renderScriptContent = () => {
    const canGenerateScript = userSelectedComponents && 
                              userSelectedComponents.hook && 
                              userSelectedComponents.factsets.length > 0 && 
                              userSelectedComponents.take && 
                              userSelectedComponents.outro;

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
          Once you have selected your script components from the "Outline" tab, you can generate the final script here.
        </p>
        <Button onClick={handleGenerateFinalScript} disabled={!canGenerateScript || isLoadingFinalScript}>
          {isLoadingFinalScript ? "Generating..." : "Generate Final Script"}
        </Button>
        {!canGenerateScript && 
            <p className="text-xs text-orange-500 mt-2">Please select a hook, at least one factset, a take, and an outro from the Outline tab first.</p>
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
              </div>
            ) : (
              <div className="text-center p-4 text-muted-foreground">
                <p>No sources found or AI Writer search not initiated for a video idea yet.</p>
                 {/* Display the processing error here if it's not a timeline display scenario */}
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

const AiWriterPageContent = () => {
  const { videoIdea, triggerSearch } = useAiWriterContext(); // Added triggerSearch here
  const ideaTitle = videoIdea || "Enter a video idea to get started";
  // Local state for the input field if needed, or use videoIdea from context directly if appropriate
  // For example, if you want to type in an input and then click a button to trigger search:
  const [localVideoIdea, setLocalVideoIdea] = useState("");

  // If you want to reflect context's videoIdea in local state (e.g. if it can be set from elsewhere)
  useEffect(() => {
    setLocalVideoIdea(videoIdea || "");
  }, [videoIdea]);

  const handleSearch = () => {
    triggerSearch(localVideoIdea);
  };

  return (
    <div className="flex flex-col w-full space-y-4 md:space-y-6 pb-12">
      {/* Example Search Input -  YOU NEED TO INTEGRATE THIS OR A SIMILAR MECHANISM */}
      <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-6">
        <div className="flex gap-2 items-center p-2 border rounded-lg bg-background">
          <input 
            type="text" 
            placeholder="Enter your video idea here..." 
            className="flex-grow p-2 border-none focus:ring-0 bg-transparent"
            value={localVideoIdea}
            onChange={(e) => setLocalVideoIdea(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(); }}
          />
          <Button onClick={handleSearch}>Generate Insights</Button>
        </div>
      </div>
      
      <TruncatedTitleHeader title={ideaTitle} />
      <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 md:space-y-8">
        <div className="w-full">
          <AiWriterTabs />
        </div>
      </div>
    </div>
  );
};

export default function AiWriterPage() {
  // Ensure AiWriterProvider is wrapping this page or a parent component in your layout structure
  return (
      <AiWriterPageContent />
  );
} 