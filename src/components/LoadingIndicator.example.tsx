import React, { useState } from 'react';
import LoadingIndicator from './LoadingIndicator';
import ActionButton from './ActionButton';

const LoadingIndicatorExample: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const simulateLoading = (setter: React.Dispatch<React.SetStateAction<boolean>>, duration = 3000) => {
    setter(true);
    setTimeout(() => setter(false), duration);
  };

  return (
    <div className="max-w-4xl mx-auto p-8 space-y-12">
      <h1 className="text-3xl font-bold mb-6">LoadingIndicator Examples</h1>
      
      {/* Basic Sizes */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold">Basic Sizes</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center space-y-4">
            <h3 className="text-lg font-medium">Small</h3>
            <LoadingIndicator size="sm" />
          </div>
          <div className="text-center space-y-4">
            <h3 className="text-lg font-medium">Medium (Default)</h3>
            <LoadingIndicator size="md" />
          </div>
          <div className="text-center space-y-4">
            <h3 className="text-lg font-medium">Large</h3>
            <LoadingIndicator size="lg" />
          </div>
        </div>
      </section>

      {/* With Messages */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold">With Messages</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Small with Message</h3>
            <LoadingIndicator size="sm" message="Loading..." />
          </div>
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Medium with Message</h3>
            <LoadingIndicator size="md" message="Processing your request..." />
          </div>
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Large with Message</h3>
            <LoadingIndicator size="lg" message="Analyzing video content..." />
          </div>
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Custom Message</h3>
            <LoadingIndicator size="md" message="Generating AI response..." />
          </div>
        </div>
      </section>

      {/* Interactive Examples */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold">Interactive Examples</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-4">
            <ActionButton
              text="Start Loading"
              onClick={() => simulateLoading(setIsLoading)}
              disabled={isLoading}
            />
            {isLoading && (
              <LoadingIndicator size="sm" message="Loading data..." />
            )}
          </div>
          
          <div className="space-y-4">
            <ActionButton
              text="Analyze Content"
              onClick={() => simulateLoading(setIsAnalyzing, 4000)}
              disabled={isAnalyzing}
            />
            {isAnalyzing && (
              <LoadingIndicator size="md" message="Analyzing..." />
            )}
          </div>
          
          <div className="space-y-4">
            <ActionButton
              text="Upload File"
              onClick={() => simulateLoading(setIsUploading, 5000)}
              disabled={isUploading}
            />
            {isUploading && (
              <LoadingIndicator size="lg" message="Uploading file..." />
            )}
          </div>
        </div>
      </section>

      {/* In Button Context */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold">In Button Context</h2>
        <div className="flex flex-wrap gap-4">
          <ActionButton
            variant="primary"
            disabled
            className="cursor-not-allowed"
          >
            <LoadingIndicator size="sm" className="mr-2" />
            Processing...
          </ActionButton>
          
          <ActionButton
            variant="secondary"
            disabled
            className="cursor-not-allowed"
          >
            <LoadingIndicator size="sm" className="mr-2" />
            Saving Changes
          </ActionButton>
          
          <ActionButton
            variant="outline"
            disabled
            className="cursor-not-allowed"
          >
            <LoadingIndicator size="sm" className="mr-2" />
            Uploading
          </ActionButton>
        </div>
      </section>

      {/* Centered Overlay Style */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold">Centered Overlay Style</h2>
        <div className="relative bg-muted rounded-lg p-8 min-h-[200px]">
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 rounded-lg">
            <LoadingIndicator size="lg" message="Loading content..." />
          </div>
          <div className="opacity-30">
            <h3 className="text-lg font-medium mb-4">Sample Content</h3>
            <p className="text-muted-foreground">
              This content is hidden behind the loading overlay. This demonstrates
              how the LoadingIndicator can be used as an overlay for content areas.
            </p>
          </div>
        </div>
      </section>

      {/* Custom Styling */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold">Custom Styling</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Custom Background</h3>
            <LoadingIndicator 
              size="md" 
              message="Custom styled..." 
              className="bg-primary/10 p-4 rounded-lg border border-primary/20"
            />
          </div>
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Vertical Layout</h3>
            <LoadingIndicator 
              size="lg" 
              message="Processing..." 
              className="flex-col"
            />
          </div>
        </div>
      </section>

      {/* Real-world Use Cases */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold">Real-world Use Cases</h2>
        <div className="space-y-8">
          {/* Form Submission */}
          <div className="border rounded-lg p-6">
            <h3 className="text-lg font-medium mb-4">Form Submission</h3>
            <div className="space-y-4">
              <input 
                type="text" 
                placeholder="Enter your name" 
                className="w-full p-2 border rounded"
                disabled={isLoading}
              />
              <div className="flex items-center gap-4">
                <ActionButton
                  text="Submit"
                  onClick={() => simulateLoading(setIsLoading, 2000)}
                  disabled={isLoading}
                />
                {isLoading && (
                  <LoadingIndicator size="sm" message="Submitting form..." />
                )}
              </div>
            </div>
          </div>

          {/* Data Table Loading */}
          <div className="border rounded-lg p-6">
            <h3 className="text-lg font-medium mb-4">Data Table Loading</h3>
            <div className="min-h-[150px] flex items-center justify-center border-2 border-dashed border-muted-foreground/25 rounded">
              <LoadingIndicator size="md" message="Loading table data..." />
            </div>
          </div>

          {/* Card Content Loading */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="border rounded-lg p-4 min-h-[120px] flex items-center justify-center">
                <LoadingIndicator size="sm" message={`Loading card ${i}...`} />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default LoadingIndicatorExample; 