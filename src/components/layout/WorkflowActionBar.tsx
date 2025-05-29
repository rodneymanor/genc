'use client';

import React from 'react';
import { Button } from "@/components/ui/button";
import { FileText, PenTool, ArrowRight, HelpCircle } from "lucide-react";

interface WorkflowActionBarProps {
  activeTab: string;
  onGenerateOutline: () => void;
  onProceedToFinalScript: () => void; 
  isLoadingOutline: boolean;
  canGenerateOutline: boolean;
  canProceedToFinalScript: boolean;
  sourceCount: number;
}

const WorkflowActionBar: React.FC<WorkflowActionBarProps> = ({
  activeTab,
  onGenerateOutline,
  onProceedToFinalScript,
  isLoadingOutline,
  canGenerateOutline,
  canProceedToFinalScript,
  sourceCount,
}) => {
  let LeftIcon = HelpCircle;
  let descriptionText = "Review the current step and proceed.";
  let actionButton = null;

  if (activeTab === "sources") {
    LeftIcon = HelpCircle; // Or a specific icon for sources
    if (isLoadingOutline) {
        descriptionText = `Generating outline from ${sourceCount} sources...`;
    } else if (canGenerateOutline) {
      descriptionText = `Your ${sourceCount} sources have been loaded. Would you like to generate an outline?`;
      actionButton = (
        <Button
          onClick={onGenerateOutline}
          disabled={isLoadingOutline}
          className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-md hover:shadow-lg ml-4 flex-shrink-0 whitespace-nowrap"
        >
          {isLoadingOutline ? "Generating..." : "Generate Outline"}
          {!isLoadingOutline && <FileText className="ml-2 h-4 w-4" />}
        </Button>
      );
    } else if (sourceCount > 0) {
        descriptionText = `${sourceCount} sources found. Processing...`;
    } else {
        descriptionText = "Waiting for sources to be found...";
    }
  } else if (activeTab === "outlines") {
    LeftIcon = FileText;
    if (canProceedToFinalScript) {
      descriptionText = "Outline generated. Ready to create the final script?";
      actionButton = (
        <Button
          onClick={onProceedToFinalScript}
          // disabled={isLoadingFinalScript} // Add this when final script generation logic is in place
          className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-md hover:shadow-lg ml-4 flex-shrink-0 whitespace-nowrap"
        >
          {/* {isLoadingFinalScript ? "Processing..." : "Create Final Script"} */}
          Create Final Script
          <PenTool className="ml-2 h-4 w-4" />
        </Button>
      );
    } else {
      descriptionText = "Outline is being processed or is not yet available.";
    }
  } else if (activeTab === "final") {
    LeftIcon = PenTool;
    descriptionText = "Final script is ready for review.";
    // Potentially add an "Export" or "Save" button here later
    actionButton = (
        <Button
            disabled // Placeholder
            className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-md hover:shadow-lg ml-4 flex-shrink-0 whitespace-nowrap"
        >
            Export Script
            <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
    );
  } else if (activeTab === "tasks") {
    descriptionText = "Review your workflow progress below.";
    // No specific action button for the tasks tab in this bar usually
  }

  return (
    <div className="w-full flex justify-center">
      <div className="w-[700px] my-4 p-4 border rounded-lg bg-muted/50 flex items-center justify-between shadow-md min-h-[76px]">
        <div className="flex items-center">
          <LeftIcon className={`mr-3 h-6 w-6 ${activeTab === 'sources' && isLoadingOutline ? 'animate-spin' : ''} text-primary flex-shrink-0`} />
          <p className="text-sm font-medium text-foreground">{descriptionText}</p>
        </div>
        {actionButton}
      </div>
    </div>
  );
};

export default WorkflowActionBar; 