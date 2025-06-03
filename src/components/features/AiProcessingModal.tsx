'use client';

import React from 'react';
import { CheckCircle, Clock, Circle, Loader2, Search, FileText, Brain, Sparkles } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';

interface AiProcessingModalProps {
  isOpen: boolean;
  currentStep: string | null;
  videoIdea: string;
  onComplete?: () => void;
}

const getStepInfo = (stepId: string, currentStep: string | null) => {
  const steps = {
    'init': { 
      icon: Circle, 
      label: 'Initializing', 
      description: 'Preparing to generate your script...',
      progress: 0 
    },
    'search': { 
      icon: Search, 
      label: 'Finding Sources', 
      description: 'Searching for relevant research materials...',
      progress: 25 
    },
    'extract': { 
      icon: FileText, 
      label: 'Extracting Content', 
      description: 'Analyzing and extracting content from sources...',
      progress: 50 
    },
    'analyze': { 
      icon: Brain, 
      label: 'Analyzing Research', 
      description: 'Processing research to understand key insights...',
      progress: 75 
    },
    'generate_options': { 
      icon: Sparkles, 
      label: 'Generating Options', 
      description: 'Creating script component options for you...',
      progress: 90 
    },
    'outline_ready': { 
      icon: CheckCircle, 
      label: 'Complete!', 
      description: 'Your script outline is ready to customize.',
      progress: 100 
    }
  };

  const step = steps[stepId as keyof typeof steps];
  if (!step) return { 
    icon: Circle, 
    label: 'Processing...', 
    description: '', 
    progress: 0,
    isActive: false,
    isCompleted: false,
    status: 'pending' as const
  };

  const isActive = currentStep === stepId;
  const isCompleted = getStepOrder(currentStep) > getStepOrder(stepId);
  
  return {
    ...step,
    isActive,
    isCompleted,
    status: isCompleted ? 'completed' : isActive ? 'active' : 'pending'
  };
};

const getStepOrder = (step: string | null): number => {
  const order = {
    'init': 0,
    'search': 1,
    'extract': 2,
    'analyze': 3,
    'generate_options': 4,
    'outline_ready': 5
  };
  return order[step as keyof typeof order] || 0;
};

const getCurrentProgress = (currentStep: string | null): number => {
  const progressMap = {
    'init': 10,
    'search': 25,
    'extract': 50,
    'analyze': 75,
    'generate_options': 90,
    'outline_ready': 100
  };
  return progressMap[currentStep as keyof typeof progressMap] || 0;
};

export const AiProcessingModal: React.FC<AiProcessingModalProps> = ({
  isOpen,
  currentStep,
  videoIdea,
  onComplete
}) => {
  const progress = getCurrentProgress(currentStep);
  const stepOrder = ['search', 'extract', 'analyze', 'generate_options', 'outline_ready'];
  
  // Auto-close and trigger completion when outline is ready
  React.useEffect(() => {
    if (currentStep === 'outline_ready' && onComplete) {
      const timer = setTimeout(() => {
        onComplete();
      }, 2000); // Wait 2 seconds to show completion, then navigate
      return () => clearTimeout(timer);
    }
  }, [currentStep, onComplete]);

  return (
    <Dialog open={isOpen} modal={true}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">Generating Your Script</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 p-4">
          {/* Video Idea Display */}
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-2">Creating script for:</p>
            <p className="font-medium text-sm bg-muted p-3 rounded-lg">{videoIdea}</p>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Step List */}
          <div className="space-y-3">
            {stepOrder.map((stepId) => {
              const stepInfo = getStepInfo(stepId, currentStep);
              const StepIcon = stepInfo.icon;
              
              return (
                <div key={stepId} className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                  stepInfo.isActive ? 'bg-primary/10 border border-primary/20' : 
                  stepInfo.isCompleted ? 'bg-green-50 dark:bg-green-950/20' : 'bg-muted/30'
                }`}>
                  <div className="flex-shrink-0">
                    {stepInfo.isActive ? (
                      <Loader2 className="h-5 w-5 animate-spin text-primary" />
                    ) : stepInfo.isCompleted ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <StepIcon className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`font-medium text-sm ${
                      stepInfo.isActive ? 'text-primary' : 
                      stepInfo.isCompleted ? 'text-green-700 dark:text-green-400' : 'text-muted-foreground'
                    }`}>
                      {stepInfo.label}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {stepInfo.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Current Status */}
          {currentStep && (
            <div className="text-center pt-2">
              <p className="text-sm text-muted-foreground">
                {currentStep === 'outline_ready' ? 
                  'Redirecting to your script outline...' : 
                  'Please wait while we process your request...'
                }
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AiProcessingModal; 