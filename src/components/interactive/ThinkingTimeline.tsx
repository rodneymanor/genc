'use client';

import React, { useState, useEffect } from 'react';
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { TypingAnimation } from "@/components/magicui/typing-animation";
import { useAiWriterContext } from "@/contexts/AiWriterContext";

interface ThinkingTimelineProps {
  isProcessing: boolean;
  currentStep: string | null; 
  errorStep?: string | null; 
}

// Define a comprehensive map for step descriptions, order, and potential status
const stepConfig: { [key: string]: { description: string; order: number; isError?: boolean; isSuccess?: boolean, isNeutral?: boolean } } = {
  init: { description: "Initializing your script generation...", order: 0 },
  search: { description: "Searching for relevant sources across the web...", order: 1 },
  search_empty: { description: "No sources found. Try a different topic or wording.", order: 1, isNeutral: true },
  search_failed: { description: "Search for sources failed. Please try again.", order: 1, isError: true },
  transcribe: { description: "Transcribing video content to extract insights...", order: 1.5 },
  transcribe_failed: { description: "Video transcription failed. Please check the URL and try again.", order: 1.5, isError: true },
  extract: { description: "Reading and analyzing content from sources...", order: 2 },
  extract_issues: { description: "Some content could not be extracted. Check Research tab for details.", order: 2, isNeutral: true },
  extract_failed: { description: "Content extraction failed for all sources.", order: 2, isError: true },
  analyze_ready: { description: "Content extraction complete. Ready for analysis.", order: 3, isSuccess: true },
  analyze: { description: "Creating comprehensive research analysis...", order: 4 },
  analyze_failed: { description: "Content analysis failed.", order: 4, isError: true },
  generate_options: { description: "Generating script components...", order: 5 },
  generate_failed: { description: "Failed to generate script options.", order: 5, isError: true },
  outline_ready: { description: "Script outline options ready for customization!", order: 6, isSuccess: true },
  complete: { description: "Script generation complete!", order: 100, isSuccess: true },
  unknown: { description: "Processing...", order: -1 }
};

// Get an ordered list of known step keys based on their 'order' property
const orderedStepKeys = Object.keys(stepConfig).sort((a, b) => stepConfig[a].order - stepConfig[b].order);

// Subtle pulsating circle component with reduced intensity
const PulsatingCircle: React.FC<{ status: string; size?: number }> = ({ status, size = 8 }) => {
  const getCircleClasses = () => {
    switch (status) {
      case 'loading':
        return "bg-foreground";
      case 'success':
        return "bg-foreground";
      case 'error':
        return "bg-foreground";
      case 'neutral':
        return "bg-muted-foreground";
      default:
        return "bg-muted-foreground/40";
    }
  };

  const getPingClasses = () => {
    switch (status) {
      case 'loading':
        return "bg-foreground animate-ping";
      case 'success':
        return "bg-foreground";
      case 'error':
        return "bg-foreground";
      default:
        return "bg-muted-foreground/20";
    }
  };

  return (
    <div className="relative flex items-center justify-center">
      <div 
        className={cn("rounded-full", getCircleClasses())}
        style={{ width: size, height: size }}
      />
      {status === 'loading' && (
        <div 
          className={cn("absolute rounded-full opacity-30", getPingClasses())}
          style={{ width: size * 1.3, height: size * 1.3 }}
        />
      )}
    </div>
  );
};

// Source bubble component
const SourceBubble: React.FC<{ source: any }> = ({ source }) => {
  const getHostname = (url: string) => {
    try {
      return new URL(url).hostname.replace(/^www\./, '');
    } catch (e) {
      return "Source";
    }
  };

  return (
    <Badge 
      variant="outline" 
      className="bg-background text-foreground border-border text-xs px-2 py-1 rounded-full"
    >
      {getHostname(source.link)}
    </Badge>
  );
};

// Component generation display
const ComponentGeneration: React.FC<{ components: any }> = ({ components }) => {
  const [showComponents, setShowComponents] = useState(false);

  useEffect(() => {
    if (components) {
      const timer = setTimeout(() => setShowComponents(true), 1000);
      return () => clearTimeout(timer);
    }
  }, [components]);

  if (!components || !showComponents) return null;

  return (
    <div className="mt-3 space-y-2">
      <div className="text-xs text-muted-foreground mb-2">Generated components:</div>
      <div className="space-y-1">
        {components.hooks && components.hooks.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Hook:</span>
            <TypingAnimation 
              className="text-xs text-foreground"
              duration={30}
              delay={0}
            >
              {components.hooks[0]?.title || "Hook component"}
            </TypingAnimation>
          </div>
        )}
        {components.bridges && components.bridges.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Bridge:</span>
            <TypingAnimation 
              className="text-xs text-foreground"
              duration={30}
              delay={200}
            >
              {components.bridges[0]?.title || "Bridge component"}
            </TypingAnimation>
          </div>
        )}
        {components.goldenNuggets && components.goldenNuggets.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Golden Nugget:</span>
            <TypingAnimation 
              className="text-xs text-foreground"
              duration={30}
              delay={400}
            >
              {components.goldenNuggets[0]?.title || "Golden Nugget component"}
            </TypingAnimation>
          </div>
        )}
        {components.wtas && components.wtas.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">What to Action:</span>
            <TypingAnimation 
              className="text-xs text-foreground"
              duration={30}
              delay={600}
            >
              {components.wtas[0]?.title || "What to Action component"}
            </TypingAnimation>
          </div>
        )}
      </div>
    </div>
  );
};

// Timeline item component with typewriter effect
const TimelineItem: React.FC<{
  item: any;
  index: number;
  shouldAnimate: boolean;
  animationDelay: number;
}> = ({ item, index, shouldAnimate, animationDelay }) => {
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    if (shouldAnimate && !hasAnimated) {
      const timer = setTimeout(() => {
        setHasAnimated(true);
      }, animationDelay);
      return () => clearTimeout(timer);
    }
  }, [shouldAnimate, hasAnimated, animationDelay]);

  if (shouldAnimate && !hasAnimated) {
    return null; // Don't render until it's time to animate
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3">
        <PulsatingCircle status={item.status} />
        {shouldAnimate && !hasAnimated ? (
          <span className="text-sm text-foreground">{item.description}</span>
        ) : shouldAnimate ? (
          <TypingAnimation 
            className="text-sm text-foreground"
            duration={40}
            delay={0}
          >
            {item.description}
          </TypingAnimation>
        ) : (
          <span className="text-sm text-foreground">{item.description}</span>
        )}
      </div>

      {/* Show sources inline with search step */}
      {item.showSources && (
        <div className="ml-5 pl-3 border-l border-border">
          <div className="text-xs text-muted-foreground mb-2">Found sources:</div>
          <div className="flex flex-wrap gap-2">
            {item.sources.slice(0, 6).map((source: any, sourceIndex: number) => (
              <SourceBubble key={source.id || sourceIndex} source={source} />
            ))}
            {item.sources.length > 6 && (
              <Badge variant="outline" className="text-xs px-2 py-1 rounded-full">
                +{item.sources.length - 6} more
              </Badge>
            )}
          </div>
        </div>
      )}

      {/* Show components inline with generation step */}
      {item.showComponents && (
        <div className="ml-5 pl-3 border-l border-border">
          <ComponentGeneration components={item.components} />
        </div>
      )}
    </div>
  );
};

const ThinkingTimeline: React.FC<ThinkingTimelineProps> = ({ isProcessing, currentStep, errorStep }) => {
  const [timelineItems, setTimelineItems] = useState<any[]>([]);
  const [currentStepDescription, setCurrentStepDescription] = useState<string>("");
  const [animatedSteps, setAnimatedSteps] = useState<Set<string>>(new Set());
  const [lastProcessedStep, setLastProcessedStep] = useState<string | null>(null);
  const { sources, scriptComponents } = useAiWriterContext();

  useEffect(() => {
    if (!currentStep) {
      setTimelineItems([]);
      setCurrentStepDescription("");
      return;
    }

    // Log errors to console but don't display them unless it's a complete failure
    if (errorStep && stepConfig[errorStep]) {
      console.log(`[ThinkingTimeline] Error occurred at step: ${errorStep} - ${stepConfig[errorStep].description}`);
    }

    const items: any[] = [];
    const currentStepOrder = stepConfig[currentStep]?.order ?? -1;
    const errorStepOrder = errorStep ? (stepConfig[errorStep]?.order ?? -1) : -1;

    // Only show error if it's a complete script generation failure
    const showError = errorStep && (
      errorStep === 'generate_failed' || 
      errorStep === 'analyze_failed' ||
      errorStep === 'extract_failed'
    );

    // Determine the highest order to display
    let displayUpToOrder = currentStepOrder;
    if (showError && errorStepOrder > -1) {
      displayUpToOrder = Math.max(displayUpToOrder, errorStepOrder);
    }
    if (isProcessing && currentStepOrder === -1 && currentStep !== 'init') {
      displayUpToOrder = Math.max(displayUpToOrder, stepConfig['unknown'].order + 1);
    }

    orderedStepKeys.forEach(stepKey => {
      const stepDetails = stepConfig[stepKey];
      if (!stepDetails || stepDetails.order === -1 || stepDetails.order > displayUpToOrder + 1) return;
      
      // Skip error steps unless they are critical failures
      if (stepDetails.isError && !showError) return;
      
      // Skip neutral/warning steps to keep timeline clean
      if (stepDetails.isNeutral) return;
      
      if (stepKey === 'complete' && (isProcessing || (currentStep !== 'complete' && (!showError || stepDetails.order > errorStepOrder)))) return;

      let status = 'pending';

      if (showError && errorStep === stepKey) {
        status = 'error';
      } else if (currentStep === stepKey) {
        if (isProcessing) {
          status = 'loading';
        } else if (stepDetails.isSuccess) {
          status = 'success';
        } else {
          status = 'success';
        }
      } else if (stepConfig[currentStep] && stepDetails.order < currentStepOrder && (!showError || stepDetails.order < errorStepOrder)) {
        status = 'success';
      }

      if (showError && errorStepOrder !== -1 && stepDetails.order > errorStepOrder) {
        status = 'pending';
      }

      items.push({
        status,
        description: stepDetails.description,
        stepKey,
        showSources: stepKey === 'search' && sources.length > 0,
        showComponents: stepKey === 'generate_options' && scriptComponents,
        sources: sources,
        components: scriptComponents
      });
    });
    
    // Handle unknown current step
    if (isProcessing && currentStep && !stepConfig[currentStep]) {
      console.log(`[ThinkingTimeline] Unknown step: ${currentStep}`);
      items.push({
        status: 'loading',
        description: `Processing: ${currentStep}...`,
        stepKey: 'unknown',
        sources: sources,
        components: scriptComponents
      });
    }

    setTimelineItems(items);
    
    // Set current step description for typewriter effect (skip error descriptions unless critical)
    if (currentStep && stepConfig[currentStep]) {
      const stepDetails = stepConfig[currentStep];
      if (!stepDetails.isError || showError) {
        setCurrentStepDescription(stepDetails.description);
      } else {
        // Log error but don't show in UI
        console.log(`[ThinkingTimeline] Error step skipped from display: ${currentStep} - ${stepDetails.description}`);
        setCurrentStepDescription("");
      }
    } else if (isProcessing && currentStep) {
      setCurrentStepDescription(`Processing: ${currentStep}...`);
    }
  }, [currentStep, isProcessing, errorStep, sources, scriptComponents]);

  // Track step changes and trigger animations
  useEffect(() => {
    if (currentStep && currentStep !== lastProcessedStep) {
      // Mark this step as needing animation
      setAnimatedSteps(prev => new Set([...prev, currentStep]));
      setLastProcessedStep(currentStep);
    }
  }, [currentStep, lastProcessedStep]);

  if (!currentStep && !isProcessing) {
    return null;
  }

  return (
    <div className="w-full max-w-none p-4 bg-background rounded-lg">
      {/* Current Step with Typewriter Effect */}
      {currentStepDescription && (
        <div className="mb-4 p-3 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-3">
            <PulsatingCircle status="loading" size={6} />
            <TypingAnimation 
              className="text-sm text-foreground leading-relaxed tracking-normal"
              duration={40}
              delay={0}
            >
              {currentStepDescription}
            </TypingAnimation>
          </div>
        </div>
      )}

      {/* Timeline Steps */}
      <div className="space-y-3">
        {timelineItems.map((item, index) => {
          const shouldAnimate = animatedSteps.has(item.stepKey) || item.status === 'loading';
          const animationDelay = index * 300; // Stagger animations by 300ms

          return (
            <TimelineItem
              key={`${item.stepKey}-${index}`}
              item={item}
              index={index}
              shouldAnimate={shouldAnimate}
              animationDelay={animationDelay}
            />
          );
        })}
      </div>
    </div>
  );
};

export default ThinkingTimeline; 