"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown, Sparkles, ArrowUp, Clock } from "lucide-react";
import { MagicCard } from "@/components/magicui/magic-card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Old StandardizedInputGroup component (copied from main page)
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
  onSetupVoiceClick,
}) => {
  return (
    <div 
      style={{ width: '640px', height: '120px' }}
      className={`relative mx-auto border-2 border-border bg-background rounded-lg shadow-sm hover:shadow-md focus-within:border-primary focus-within:shadow-lg focus-within:ring-1 focus-within:ring-primary/20 transition-all duration-200 ${className}`}
    >
      <textarea
        placeholder={inputType === "Description" ? "Describe your video idea or paste a TikTok, Instagram, YouTube, or Facebook video URL..." : "Enter URL to rewrite..."}
        className="box-border w-full h-[64px] pl-4 pr-4 pt-2 pb-4 text-base leading-normal text-foreground font-medium bg-transparent border-none outline-none focus:ring-0 block placeholder:text-muted-foreground resize-none"
        value={value}
        onChange={onChange}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (!isButtonDisabled && !isButtonLoading) {
              onButtonClick();
            }
          }
        }}
      />
      <div className="absolute bottom-0 left-0 right-0 h-14 px-3 py-2 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="text-sm font-medium text-foreground hover:bg-accent px-2">
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
              <Button variant="ghost" className="text-sm font-medium text-foreground hover:bg-accent px-2">
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

          {onSetupVoiceClick && (
            <Button
              variant="outline"
              size="sm"
              onClick={onSetupVoiceClick}
              className="text-xs px-3 py-1.5 h-auto font-medium border-primary/30 text-primary hover:bg-primary/10"
            >
              <Sparkles className="mr-1 h-3 w-3" />
              Setup Voice
            </Button>
          )}
        </div>
        
        <Button
          onClick={onButtonClick}
          disabled={isButtonLoading || isButtonDisabled}
          className="w-7 h-7 p-0 flex items-center justify-center bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:bg-muted shadow-md transition-all"
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

export default function TestInputPage() {
  // State for old input
  const [oldValue, setOldValue] = useState("");
  const [inputType, setInputType] = useState("Description");
  const [sourceOption, setSourceOption] = useState("1x");
  const [isOldLoading, setIsOldLoading] = useState(false);
  
  // State for new input
  const [newValue, setNewValue] = useState("");
  const [isNewLoading, setIsNewLoading] = useState(false);

  const handleOldSubmit = () => {
    setIsOldLoading(true);
    setTimeout(() => {
      setIsOldLoading(false);
      alert(`Old input submitted: ${oldValue}`);
    }, 2000);
  };

  const handleNewSubmit = () => {
    setIsNewLoading(true);
    setTimeout(() => {
      setIsNewLoading(false);
      alert(`New input submitted: ${newValue}`);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-12">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Input Field Comparison</h1>
          <p className="text-muted-foreground">
            Compare the old StandardizedInputGroup with the new simplified input
          </p>
        </div>

        {/* Old Input Section */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-center">Old Input (StandardizedInputGroup)</h2>
          <p className="text-sm text-muted-foreground text-center">
            Complex input with dropdowns, magic card wrapper, and advanced features
          </p>
          <div className="flex justify-center">
            <StandardizedInputGroup
              value={oldValue}
              onChange={(e) => setOldValue(e.target.value)}
              onButtonClick={handleOldSubmit}
              isButtonLoading={isOldLoading}
              isButtonDisabled={!oldValue.trim()}
              inputType={inputType}
              onInputTypeChange={setInputType}
              sourceOption={sourceOption}
              onSourceOptionChange={setSourceOption}
              onSetupVoiceClick={() => alert("Setup Voice clicked!")}
            />
          </div>
        </div>

        {/* New Input Section */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-center">New Input (Simplified)</h2>
          <p className="text-sm text-muted-foreground text-center">
            Clean and simple input focused on the core functionality
          </p>
          <div className="max-w-2xl mx-auto">
            <div className="flex gap-2 items-center p-2 border rounded-lg bg-background">
              <input 
                type="text" 
                placeholder="Enter your video idea here..." 
                className="flex-grow p-2 border-none focus:ring-0 bg-transparent text-base"
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleNewSubmit(); }}
              />
              <Button 
                onClick={handleNewSubmit} 
                disabled={!newValue.trim() || isNewLoading}
              >
                {isNewLoading ? "Loading..." : "Generate Script"}
              </Button>
            </div>
          </div>
        </div>

        {/* Comparison Notes */}
        <div className="bg-muted/50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Key Differences</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-green-600 mb-2">Old Input Advantages:</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• More visual impact with MagicCard wrapper</li>
                <li>• Advanced features (input type, source options)</li>
                <li>• Setup Voice functionality</li>
                <li>• Sophisticated hover/focus effects</li>
                <li>• Textarea allows multi-line input</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-blue-600 mb-2">New Input Advantages:</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Cleaner, more focused interface</li>
                <li>• Faster to load and render</li>
                <li>• Better mobile responsiveness</li>
                <li>• Reduced cognitive load</li>
                <li>• Easier to maintain</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="text-center">
          <Button variant="outline" onClick={() => window.history.back()}>
            ← Back to Main Page
          </Button>
        </div>
      </div>
    </div>
  );
} 