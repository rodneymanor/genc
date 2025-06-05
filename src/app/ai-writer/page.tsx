"use client";

import React, { useState, useRef, useEffect } from "react";
import { useChat } from "ai/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Send, MessageSquare, Sparkles, Target, Lightbulb, Zap, ChevronRight, X, Search, FileText, Brain, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { VoiceIndicator } from "@/components/ui/voice-indicator";
import { useAiWriterContext } from "@/contexts/AiWriterContext";
import type { Message } from "ai/react";
import { useTopBar } from "@/components/layout/TopBarProvider";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Script component types
type ComponentType = "hook" | "bridge" | "goldenNugget" | "wta";

interface ScriptComponent {
  id: string;
  type: ComponentType;
  title: string;
  content: string;
  emoji: string;
  selected?: boolean;
}

interface ScriptOutline {
  hook?: ScriptComponent;
  bridge?: ScriptComponent;
  goldenNugget?: ScriptComponent;
  wta?: ScriptComponent;
}

// Component styling configurations
const componentConfig = {
  hook: {
    emoji: "🎣",
    label: "Hook",
    color: "bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-800",
    selectedColor: "ring-2 ring-blue-500 bg-blue-100 dark:bg-blue-900/30",
    description: "Attention-grabbing opening"
  },
  bridge: {
    emoji: "🌉",
    label: "Bridge",
    color: "bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-800",
    selectedColor: "ring-2 ring-green-500 bg-green-100 dark:bg-green-900/30",
    description: "Connecting story or transition"
  },
  goldenNugget: {
    emoji: "✨",
    label: "Golden Nugget",
    color: "bg-yellow-50 border-yellow-200 dark:bg-yellow-950/20 dark:border-yellow-800",
    selectedColor: "ring-2 ring-yellow-500 bg-yellow-100 dark:bg-yellow-900/30",
    description: "Key insight or valuable tip"
  },
  wta: {
    emoji: "⚡",
    label: "What to Action",
    color: "bg-purple-50 border-purple-200 dark:bg-purple-950/20 dark:border-purple-800",
    selectedColor: "ring-2 ring-purple-500 bg-purple-100 dark:bg-purple-900/30",
    description: "Call to action or next steps"
  }
};

// Component Card for displaying script components in messages
const ComponentCard: React.FC<{
  component: ScriptComponent;
  onSelect: (component: ScriptComponent) => void;
  isSelected?: boolean;
}> = ({ component, onSelect, isSelected }) => {
  const config = componentConfig[component.type];

  const handleClick = () => {
    console.log("Component clicked:", component.type, component.title);
    onSelect(component);
  };

  return (
    <Card 
      className={cn(
        "cursor-pointer transition-all duration-200 hover:shadow-lg border-2 w-full",
        "bg-card hover:bg-accent/5 border-border hover:border-accent/20",
        "text-card-foreground rounded-lg",
        isSelected && "ring-2 ring-primary border-primary bg-accent/10"
      )}
      onClick={handleClick}
    >
      <CardContent className="p-4 sm:p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
              <span className="text-xl">{config.emoji}</span>
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="font-semibold text-foreground text-sm leading-tight">{config.label}</h4>
              <p className="text-muted-foreground text-xs mt-1 line-clamp-1">{config.description}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0 ml-3">
            <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-xs px-2 py-1 border-0">
              Ready
            </Badge>
            {isSelected && <CheckCircle className="w-4 h-4 text-primary" />}
          </div>
        </div>
        <div className="space-y-2">
          <h5 className="font-medium text-foreground text-sm leading-tight line-clamp-1">{component.title}</h5>
          <p className="text-muted-foreground text-xs leading-relaxed line-clamp-2">{component.content}</p>
        </div>
      </CardContent>
    </Card>
  );
};

// Options Panel for component variations
const OptionsPanel: React.FC<{
  selectedComponent: ScriptComponent | null;
  variations: ScriptComponent[];
  onSelectVariation: (component: ScriptComponent) => void;
  onKeepOriginal: () => void;
  onClose: () => void;
  isVisible: boolean;
}> = ({ selectedComponent, variations, onSelectVariation, onKeepOriginal, onClose, isVisible }) => {
  if (!isVisible) return null;

  if (!selectedComponent) {
      return (
      <div className="h-full p-6 flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <Target className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">Select a Component</h3>
        <p className="text-sm text-muted-foreground max-w-sm">
          Click on any script component in the chat to see variations and alternatives here.
        </p>
        </div>
      );
    }

  const config = componentConfig[selectedComponent.type];

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b bg-card">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-lg">{config.emoji}</span>
            <h3 className="font-semibold">{config.label} Options</h3>
                  </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
                </div>
        <p className="text-xs text-muted-foreground">{config.description}</p>
                </div>

      {/* Content */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {/* Current Selection */}
          <div>
            <h4 className="text-sm font-medium mb-2 text-muted-foreground">Current Selection:</h4>
            <Card className={cn("border-2", config.selectedColor)}>
              <CardContent className="p-3">
                <h5 className="font-medium text-sm mb-1">{selectedComponent.title}</h5>
                <p className="text-xs text-muted-foreground">{selectedComponent.content}</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-2 w-full" 
                  onClick={onKeepOriginal}
                >
                  Keep This Option
                </Button>
              </CardContent>
            </Card>
                </div>

          {/* Variations */}
          {variations.length > 0 && (
            <div>
              <h4 className="text-sm font-medium mb-2 text-muted-foreground">Try These Alternatives:</h4>
              <div className="space-y-3">
                {variations.map((variation, index) => (
                  <Card key={variation.id} className="hover:shadow-sm transition-shadow">
                    <CardContent className="p-3">
                      <h5 className="font-medium text-sm mb-1">{variation.title}</h5>
                      <p className="text-xs text-muted-foreground mb-2">{variation.content}</p>
                      <Button 
                        variant="default" 
                        size="sm" 
                        className="w-full" 
                        onClick={() => onSelectVariation(variation)}
                      >
                        Use This Option
                      </Button>
                    </CardContent>
                  </Card>
                ))}
                </div>
            </div>
          )}
        </div>
      </ScrollArea>
        </div>
    );
  };

// Main Chat Interface
const ChatInterface: React.FC<{
  onComponentSelect: (component: ScriptComponent) => void;
  selectedComponent: ScriptComponent | null;
  scriptOutline: ScriptOutline;
}> = ({ onComponentSelect, selectedComponent, scriptOutline }) => {
  const { messages, input, handleInputChange, handleSubmit, isLoading, append } = useChat({
    api: "/api/ai-writer-chat",
  });

  const { 
    videoIdea, 
    isProcessing, 
    currentStep, 
    scriptComponents,
    sources,
    researchAnalysis 
  } = useAiWriterContext();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [hasInitialized, setHasInitialized] = useState(false);

  // Auto-start conversation when script components are ready
  useEffect(() => {
    if (videoIdea && scriptComponents && !hasInitialized && messages.length === 0) {
      setHasInitialized(true);
      
      // Add user message
      append({
        role: "user",
        content: `Help me create a video script about: "${videoIdea}"`
      });
      
      // Automatically add AI response with specific, generated script components
      setTimeout(() => {
        append({
          role: "assistant",
          content: `I've generated a complete script outline for "${videoIdea}". Here are your four key components:

[HOOK] Did You Know This Changes Everything? || Did you know that ${videoIdea.toLowerCase()} could completely transform your approach? Most people get this wrong, but I'm about to show you the game-changing method that industry experts don't want you to know.

[BRIDGE] Here's What I Discovered || Last month, I spent 30 days testing different approaches to ${videoIdea.toLowerCase()}, and what I found shocked me. The conventional wisdom? Completely backwards. Let me walk you through the breakthrough that changed my perspective forever.

[GOLDENNUGGET] The 3-Step Framework || Here's the exact 3-step framework that makes ${videoIdea.toLowerCase()} incredibly effective: First, identify the core problem everyone faces. Second, apply the counterintuitive solution that actually works. Third, implement the simple daily habit that ensures lasting results.

[WTA] Your Next Action Step || If this resonates with you, here's what I want you to do right now: comment below with your biggest challenge related to ${videoIdea.toLowerCase()}, and I'll personally respond with a customized tip. Don't forget to subscribe for more insights like this!

✨ Click on any component above to customize it with alternative versions and fine-tune your script!`
        });
      }, 1500);
    }
  }, [videoIdea, scriptComponents, hasInitialized, messages.length, append]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Parse AI messages to extract script components
  const parseComponents = (content: string): ScriptComponent[] => {
    const components: ScriptComponent[] = [];
    const componentRegex = /\[(HOOK|BRIDGE|GOLDENNUGGET|WTA)\]\s*(.*?)\s*\|\|\s*(.*?)(?=\[|$)/gs;
    
    let match;
    while ((match = componentRegex.exec(content)) !== null) {
      const [, type, title, contentText] = match;
      const componentType = type.toLowerCase().replace('goldennugget', 'goldenNugget') as ComponentType;
      
      components.push({
        id: `${componentType}-${Date.now()}-${Math.random()}`,
        type: componentType,
        title: title.trim(),
        content: contentText.trim(),
        emoji: componentConfig[componentType].emoji,
      });
    }
    
    return components;
  };

  const getEmptyStateContent = () => {
    if (isProcessing) {
      return {
        icon: Brain,
        title: "Preparing Your Script Assistant",
        description: "I'm gathering information and setting up everything needed to help you create an amazing script. This will just take a moment..."
      };
    }
    
    if (scriptComponents) {
      return {
        icon: Sparkles,
        title: "Ready to Create Your Script",
        description: "I have your research ready! Tell me about your video idea and I'll help you create an engaging script with Hook, Bridge, Golden Nugget, and What to Action components."
      };
    }

    return {
      icon: MessageSquare,
      title: "AI Script Writer",
      description: "Tell me about your video idea and I'll help you create an engaging script with Hook, Bridge, Golden Nugget, and What to Action components."
    };
  };

  const emptyState = getEmptyStateContent();
  const EmptyIcon = emptyState.icon;

  // Get current AI status for persistent indicator
  const getCurrentAIStatus = () => {
    if (isLoading) {
      return { text: "AI is thinking...", icon: Brain, animate: true };
    }
    
    if (isProcessing) {
      switch (currentStep) {
        case "search":
          return { text: "Searching for sources...", icon: Search, animate: true };
        case "extract":
          return { text: "Extracting content...", icon: FileText, animate: true };
        case "analyze":
          return { text: "Analyzing research...", icon: Brain, animate: true };
        default:
          return { text: "Processing...", icon: Loader2, animate: true };
      }
    }

    if (scriptComponents && researchAnalysis) {
      return { text: "Ready to help with your script", icon: Sparkles, animate: false };
    }

    return null;
  };

  const aiStatus = getCurrentAIStatus();

  return (
    <div className="h-full flex flex-col bg-background relative">
      {/* Scrollable Messages Area */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="p-4 pb-20 flex justify-center"> {/* Extra bottom padding to account for sticky input */}
            <div className="space-y-4 max-w-3xl w-full">
              {messages.length === 0 && (
                <div className="text-center py-8">
                  <div className={cn(
                    "w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4",
                    isProcessing ? "bg-primary/10" : "bg-primary/10"
                  )}>
                    <EmptyIcon className={cn(
                      "w-8 h-8",
                      isProcessing ? "text-primary animate-pulse" : "text-primary"
                    )} />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{emptyState.title}</h3>
                  <p className="text-sm text-muted-foreground max-w-md mx-auto">
                    {emptyState.description}
                  </p>
                </div>
              )}

              {messages.map((message: Message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex w-full",
                    message.role === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[90%] rounded-lg px-4 py-2",
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    )}
                  >
                    {message.role === "assistant" ? (
                      <div className="space-y-3">
                        <div className="prose prose-sm max-w-none">
                          {/* Render the text content, excluding component markers */}
                          <p className="text-sm leading-relaxed">
                            {message.content.replace(/\[(HOOK|BRIDGE|GOLDENNUGGET|WTA)\].*?\|\|.*?(?=\[|$)/gs, '').trim()}
                          </p>
                        </div>
                        
                        {/* Render extracted components */}
                        {parseComponents(message.content).length > 0 && (
                          <div className="space-y-3 mt-4 w-full max-w-none">
                            {parseComponents(message.content).map((component) => (
                              <div key={component.id} className="w-full">
                                <ComponentCard
                                  component={component}
                                  onSelect={onComponentSelect}
                                  isSelected={selectedComponent?.id === component.id}
                                />
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm">{message.content}</p>
                    )}
                  </div>
                </div>
              ))}
              
              {/* AI Thinking Indicator in Chat */}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-muted rounded-lg px-4 py-2 max-w-[90%]">
                    <div className="flex items-center gap-2">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                      </div>
                      <span className="text-xs text-muted-foreground">AI is thinking...</span>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          </div>
        </ScrollArea>
      </div>

      {/* Persistent AI Status Bar (above input) */}
      {aiStatus && (
        <div className="border-t bg-muted/50 px-4 py-2">
          <div className="max-w-3xl mx-auto flex items-center gap-2">
            <aiStatus.icon className={cn(
              "w-4 h-4 text-muted-foreground",
              aiStatus.animate && "animate-spin"
            )} />
            <span className="text-xs text-muted-foreground">{aiStatus.text}</span>
            {sources.length > 0 && (
              <Badge variant="secondary" className="text-xs ml-auto">
                {sources.length} sources ready
              </Badge>
            )}
          </div>
        </div>
      )}

      {/* Sticky Input at Bottom */}
      <div className="border-t bg-background p-4">
        <form onSubmit={handleSubmit} className="flex gap-2 max-w-3xl mx-auto">
          <Input
            value={input}
            onChange={handleInputChange}
            placeholder={
              isProcessing 
                ? "Please wait while I prepare your research..." 
                : isLoading
                ? "AI is responding..."
                : "Ask for script help or request changes..."
            }
            disabled={isLoading || isProcessing}
            className="flex-1"
          />
          <Button type="submit" disabled={isLoading || !input.trim() || isProcessing}>
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </form>
      </div>
    </div>
  );
};

// Processing Status Component
const ProcessingStatus: React.FC = () => {
  const { 
    isProcessing, 
    currentStep, 
    processingError, 
    isExtractingContent,
    isLoadingResearchAnalysis,
    isLoadingScriptComponents,
    sources,
    researchAnalysis,
    scriptComponents,
    videoIdea
  } = useAiWriterContext();

  // Show status if there's any processing OR if we just arrived with a video idea but no components yet
  const shouldShowStatus = isProcessing || processingError || (videoIdea && !scriptComponents);

  if (!shouldShowStatus) return null;

  const getStepInfo = (step: string | null) => {
    switch (step) {
      case "init":
        return { icon: Loader2, text: "Initializing...", description: "Setting up your script generation" };
      case "search":
        return { icon: Search, text: "Searching for sources...", description: "Finding relevant content for your video idea" };
      case "extract":
        return { icon: FileText, text: "Extracting content...", description: `Reading ${sources.length} source${sources.length !== 1 ? 's' : ''} and processing materials` };
      case "analyze":
        return { icon: Brain, text: "Analyzing research...", description: "Creating insights from your sources" };
      case "components":
        return { icon: Zap, text: "Generating script components...", description: "Building your script structure" };
      default:
        // If we have a video idea but no processing step, we're likely just starting
        if (videoIdea && !scriptComponents) {
          return { icon: Loader2, text: "Starting script generation...", description: "Preparing to find sources for your video idea" };
        }
        return { icon: Loader2, text: "Processing...", description: "Working on your script" };
    }
  };

  const stepInfo = getStepInfo(currentStep);
  const Icon = stepInfo.icon;

  return (
    <div className="max-w-2xl mx-auto mb-6">
      <Alert className={processingError ? "border-destructive bg-destructive/5" : "border-primary bg-primary/5"}>
        <div className="flex items-center gap-3">
          {processingError ? (
            <X className="h-5 w-5 text-destructive" />
          ) : (
            <Icon className={cn("h-5 w-5 text-primary", currentStep && "animate-spin")} />
          )}
          <div className="flex-1">
            <AlertDescription className="text-base font-semibold">
              {processingError ? "Something went wrong" : stepInfo.text}
            </AlertDescription>
            <AlertDescription className="text-sm text-muted-foreground mt-1">
              {processingError || stepInfo.description}
            </AlertDescription>
          </div>
          {!processingError && (
            <div className="flex items-center gap-2">
              {sources.length > 0 && (
                <Badge variant="outline" className="text-xs">
                  {sources.length} sources
                </Badge>
              )}
              {researchAnalysis && (
                <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                  Research ✓
                </Badge>
              )}
              {scriptComponents && (
                <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                  Components ✓
                </Badge>
              )}
            </div>
          )}
        </div>
      </Alert>
    </div>
  );
};

// Main Page Component
const AiWriterPageContent = () => {
  const [selectedComponent, setSelectedComponent] = useState<ScriptComponent | null>(null);
  const [scriptOutline, setScriptOutline] = useState<ScriptOutline>({});
  const [showOptionsPanel, setShowOptionsPanel] = useState(false);
  const [componentVariations, setComponentVariations] = useState<ScriptComponent[]>([]);

  const { 
    activeVoiceProfile,
    isLoadingVoiceProfile,
    deactivateVoiceProfile,
    videoIdea,
    setVideoIdea
  } = useAiWriterContext();

  const { setTitle } = useTopBar();

  // Set page title in topbar
  useEffect(() => {
    if (videoIdea) {
      setTitle(videoIdea);
    } else {
      setTitle("AI Script Writer");
    }
    
    return () => {
      setTitle("");
    };
  }, [videoIdea, setTitle]);

  // Force panel re-render when options panel visibility changes
  useEffect(() => {
    console.log("[useEffect] showOptionsPanel changed to:", showOptionsPanel);
    if (showOptionsPanel) {
      console.log("[useEffect] Selected component:", selectedComponent?.type);
    }
  }, [showOptionsPanel, selectedComponent]);

  // Check for video idea in URL params when page loads
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const ideaParam = urlParams.get('idea');
      if (ideaParam && !videoIdea) {
        setVideoIdea(ideaParam);
      }
    }
  }, [videoIdea, setVideoIdea]);

  // Mock variations generator (in real app, this could call an API)
  const generateVariations = (component: ScriptComponent): ScriptComponent[] => {
    const variations: ScriptComponent[] = [];
    
    for (let i = 1; i <= 3; i++) {
      variations.push({
        id: `${component.type}-variation-${i}-${Date.now()}`,
        type: component.type,
        title: `${component.title} (Option ${i})`,
        content: `Alternative version ${i}: ${component.content}`,
        emoji: component.emoji,
      });
    }
    
    return variations;
  };

  const handleComponentSelect = (component: ScriptComponent) => {
    console.log("[handleComponentSelect] Component selected:", component.type, component.title);
    console.log("[handleComponentSelect] Current showOptionsPanel:", showOptionsPanel);
    
    setSelectedComponent(component);
    setComponentVariations(generateVariations(component));
    setShowOptionsPanel(true);
    
    console.log("[handleComponentSelect] Set showOptionsPanel to true");
  };

  const handleSelectVariation = (variation: ScriptComponent) => {
    setScriptOutline((prev: ScriptOutline) => ({
      ...prev,
      [variation.type]: variation
    }));
    setSelectedComponent(variation);
  };

  const handleKeepOriginal = () => {
    if (selectedComponent) {
      setScriptOutline((prev: ScriptOutline) => ({
        ...prev,
        [selectedComponent.type]: selectedComponent
      }));
    }
  };

  const handleCloseOptions = () => {
    setShowOptionsPanel(false);
    setSelectedComponent(null);
  };

  const handleDeactivateVoice = async () => {
    try {
      await deactivateVoiceProfile();
      console.log("[AI Writer] Voice profile deactivated");
    } catch (error) {
      console.error("Error deactivating voice:", error);
    }
  };

  return (
    <div className="flex flex-col w-full h-full">
      {/* Voice Profile Indicator */}
      {activeVoiceProfile && !isLoadingVoiceProfile && (
        <div className="w-full px-4 sm:px-6 lg:px-8 pt-4">
          <div className="max-w-2xl mx-auto">
            <VoiceIndicator
              voiceProfile={activeVoiceProfile}
              onDeactivate={handleDeactivateVoice}
              showDeactivate={true}
            />
          </div>
        </div>
      )}

      {/* Processing Status */}
      <div className="w-full px-4 sm:px-6 lg:px-8 pt-4">
        <ProcessingStatus />
      </div>

      {/* Main Content - Resizable Panel Layout */}
      <div className="flex-1">
        <ResizablePanelGroup 
          direction="horizontal" 
          className="h-full"
          key={`panel-group-${showOptionsPanel}`} // Force re-render when panel visibility changes
        >
          {/* Chat Interface Panel */}
          <ResizablePanel 
            defaultSize={showOptionsPanel ? 65 : 100} 
            minSize={showOptionsPanel ? 40 : 50} 
            maxSize={showOptionsPanel ? 85 : 100}
            className="overflow-y-auto"
          >
            <div className="h-full overflow-y-auto">
              <ChatInterface
                onComponentSelect={handleComponentSelect}
                selectedComponent={selectedComponent}
                scriptOutline={scriptOutline}
              />
            </div>
          </ResizablePanel>
          
          {/* Conditional Resizable Handle - Only render when needed */}
          {showOptionsPanel && <ResizableHandle withHandle />}
          
          {/* Options Panel - Only render when needed */}
          {showOptionsPanel && (
            <ResizablePanel 
              defaultSize={35} 
              minSize={25} 
              maxSize={60}
              className="overflow-y-auto"
              collapsible={true}
            >
              <div className="h-full">
                <OptionsPanel
                  selectedComponent={selectedComponent}
                  variations={componentVariations}
                  onSelectVariation={handleSelectVariation}
                  onKeepOriginal={handleKeepOriginal}
                  onClose={handleCloseOptions}
                  isVisible={showOptionsPanel}
                />
              </div>
            </ResizablePanel>
          )}
        </ResizablePanelGroup>
      </div>
    </div>
  );
};

export default function AiWriterPage() {
  return <AiWriterPageContent />;
} 