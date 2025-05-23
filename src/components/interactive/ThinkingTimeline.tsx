'use client';

import React, { useState, useEffect } from 'react';
import { Timeline } from 'antd';
import { ClockCircleOutlined, CheckCircleOutlined, LoadingOutlined, CloseCircleOutlined, QuestionCircleOutlined } from '@ant-design/icons';

interface ThinkingTimelineProps {
  isProcessing: boolean;
  currentStep: string | null; 
  errorStep?: string | null; 
}

// Define a comprehensive map for step descriptions, order, and potential status
const stepConfig: { [key: string]: { description: string; order: number; isError?: boolean; isSuccess?: boolean, isNeutral?: boolean } } = {
  init: { description: "Initializing process...", order: 0 },
  search: { description: "Searching for relevant sources...", order: 1 },
  search_empty: { description: "No sources found. Try a different topic or wording.", order: 1, isNeutral: true },
  search_failed: { description: "Search for sources failed. Please try again.", order: 1, isError: true },
  extract: { description: "Extracting content from sources...", order: 2 },
  extract_issues: { description: "Some content could not be extracted. Check Research tab for details.", order: 2, isNeutral: true }, // Neutral, as some might succeed
  extract_failed: { description: "Content extraction failed for all sources.", order: 2, isError: true },
  analyze_ready: { description: "Content extraction complete. Ready for analysis.", order: 3, isSuccess: true },
  analyze: { description: "Analyzing content & generating insights...", order: 4 },
  analyze_failed: { description: "Content analysis failed.", order: 4, isError: true },
  generate_options: { description: "Generating script outline options...", order: 5 },
  generate_failed: { description: "Failed to generate script options.", order: 5, isError: true },
  outline_ready: { description: "Script outline options ready!", order: 6, isSuccess: true },
  complete: { description: "Process complete!", order: 100, isSuccess: true }, // High order to ensure it's last if explicitly set
  // Fallback for unknown steps
  unknown: { description: "Processing... (current step unknown)", order: -1 }
};

// Get an ordered list of known step keys based on their 'order' property
const orderedStepKeys = Object.keys(stepConfig).sort((a, b) => stepConfig[a].order - stepConfig[b].order);

const ThinkingTimeline: React.FC<ThinkingTimelineProps> = ({ isProcessing, currentStep, errorStep }) => {
  const [timelineItems, setTimelineItems] = useState<any[]>([]);

  useEffect(() => {
    if (!currentStep) {
      setTimelineItems([]);
      return;
    }

    const items: any[] = [];
    const currentStepOrder = stepConfig[currentStep]?.order ?? -1;
    const errorStepOrder = errorStep ? (stepConfig[errorStep]?.order ?? -1) : -1;

    // Determine the highest order to display (either current processing step or error step)
    let displayUpToOrder = currentStepOrder;
    if (errorStep && errorStepOrder > -1) {
      displayUpToOrder = Math.max(displayUpToOrder, errorStepOrder);
    }
    // If processing, ensure current step is at least shown
    if (isProcessing && currentStepOrder === -1 && currentStep !== 'init') {
        // if currentStep is unknown but processing, still show it
        displayUpToOrder = Math.max(displayUpToOrder, stepConfig['unknown'].order +1); // Ensure it's considered
    }


    orderedStepKeys.forEach(stepKey => {
      const stepDetails = stepConfig[stepKey];
      if (!stepDetails || stepDetails.order === -1 || stepDetails.order > displayUpToOrder +1 ) return; // Skip unknown steps or steps beyond current flow
      // Don't show 'complete' unless it's the actual currentStep and not processing, or if an error happened before it
      if (stepKey === 'complete' && (isProcessing || (currentStep !== 'complete' && errorStepOrder < stepDetails.order))) return;

      let icon = <ClockCircleOutlined />;
      let color = 'gray'; // Default for pending steps

      if (errorStep === stepKey || (stepDetails.isError && currentStep === stepKey) ) {
        icon = <CloseCircleOutlined />;
        color = 'red';
      } else if (currentStep === stepKey) {
        if (isProcessing) {
          icon = <LoadingOutlined />;
          color = 'blue';
        } else if (stepDetails.isSuccess) {
          icon = <CheckCircleOutlined />;
          color = 'green';
        } else if (stepDetails.isNeutral) {
            icon = <QuestionCircleOutlined />;
            color = 'gold'; // Or another neutral color
        } else {
          icon = <CheckCircleOutlined />;
          color = 'green'; // Default success for non-processing current step
        }
      } else if (stepConfig[currentStep] && stepDetails.order < currentStepOrder && (errorStepOrder === -1 || stepDetails.order < errorStepOrder)) {
        // Past steps that were successful (and not an error step)
        icon = <CheckCircleOutlined />;
        color = 'green';
      }
      // If an error occurred, subsequent steps shouldn't appear as successfully completed or loading
      if (errorStep && errorStepOrder !== -1 && stepDetails.order > errorStepOrder) {
          // Gray out steps that would have come after the error
          icon = <ClockCircleOutlined />;
          color = 'gray';
      }


      items.push({
        color: color,
        dot: icon,
        children: stepDetails.description,
      });
    });
    
    // Handle unknown current step if processing
    if (isProcessing && currentStep && !stepConfig[currentStep]) {
        items.push({
            color: 'blue',
            dot: <LoadingOutlined />,
            children: `Processing: ${currentStep}...`
        });
    }

    setTimelineItems(items);
  }, [currentStep, isProcessing, errorStep]);

  return (
    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4 text-gray-700 dark:text-gray-200">Processing Video Idea...</h3>
      {timelineItems.length > 0 ? (
        <Timeline items={timelineItems} />
      ) : (
        <p className="text-gray-500 dark:text-gray-400">Ready to start or process completed.</p>
      )}
    </div>
  );
};

export default ThinkingTimeline; 