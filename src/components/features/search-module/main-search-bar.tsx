"use client";
import { useState, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Mic, ArrowUp } from "lucide-react";
import { useAiWriterContext } from "@/contexts/AiWriterContext";
import { useRouter } from "next/navigation";
import Image from "next/image";
import StylishHeadline from "@/components/common/StylishHeadline";
import { ShineBorder } from "@/components/magicui/shine-border";
import { RainbowButton } from "@/components/magicui/rainbow-button";

const placeholderPrefix = "Ask Scribo to create a script about ";
const placeholderSuffixes = [
  "a futuristic city.",
  "the history of AI.",
  "sustainable living.",
  "a new marketing strategy.",
  "your favorite topic!"
];

export function MainSearchBar() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isAnalyzeMode, setIsAnalyzeMode] = useState(false);
  const { setVideoIdea, triggerSearch } = useAiWriterContext();
  const router = useRouter();

  // State for typing animation
  const [currentSuffixIndex, setCurrentSuffixIndex] = useState(0);
  const [displayedSuffix, setDisplayedSuffix] = useState("");
  const [isTyping, setIsTyping] = useState(true);
  const [charIndex, setCharIndex] = useState(0);

  useEffect(() => {
    const typingSpeed = 100; // milliseconds
    const deletingSpeed = 50;
    const delayBetweenSuffixes = 1500;

    let timeoutId: NodeJS.Timeout;

    if (isTyping) {
      if (charIndex < placeholderSuffixes[currentSuffixIndex].length) {
        timeoutId = setTimeout(() => {
          setDisplayedSuffix((prev) => prev + placeholderSuffixes[currentSuffixIndex][charIndex]);
          setCharIndex((prev) => prev + 1);
        }, typingSpeed);
      } else {
        // Finished typing current suffix, wait then start deleting
        timeoutId = setTimeout(() => setIsTyping(false), delayBetweenSuffixes);
      }
    } else {
      // Deleting
      if (charIndex > 0) {
        timeoutId = setTimeout(() => {
          setDisplayedSuffix((prev) => prev.substring(0, prev.length - 1));
          setCharIndex((prev) => prev - 1);
        }, deletingSpeed);
      } else {
        // Finished deleting, move to next suffix and start typing
        setIsTyping(true);
        setCurrentSuffixIndex((prevIndex) => (prevIndex + 1) % placeholderSuffixes.length);
        // setDisplayedSuffix(""); // Already empty
      }
    }

    return () => clearTimeout(timeoutId);
  }, [charIndex, currentSuffixIndex, displayedSuffix, isTyping]);

  const handleSearch = () => {
    if (isAnalyzeMode) {
      if (!searchTerm.trim()) {
        console.warn("Search term is empty for AI Writer/Analyze mode.");
        return;
      }
      setVideoIdea(searchTerm);
      triggerSearch(searchTerm);
      router.push("/ai-writer");
    } else {
      console.log("Performing general submission for:", searchTerm);
      // Implement general submission logic here if different from analyze/research
    }
  };

  const handleMicClick = () => {
    console.log("Mic button clicked. Voice input not yet implemented.");
  };

  return (
    <div className="w-full mx-auto my-8 p-0 space-y-2 flex flex-col items-center">
      <div className="text-center mb-2">
        <Image
          src="/scribo-logo.png"
          alt="Scribo Logo"
          width={150} 
          height={75} 
          className="mx-auto filter drop-shadow-lg"
          priority
        />
      </div>
      <StylishHeadline />
      
      <div className="w-full max-w-3xl bg-card rounded-xl p-4 space-y-3 relative overflow-hidden">
      <ShineBorder shineColor={["#A07CFE", "#FE8FB5", "#FFBE7B"]} />
        <Textarea
          placeholder={placeholderPrefix + displayedSuffix}
          className="w-full min-h-[100px] text-base border-0 focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none resize-none p-2 bg-transparent"
          value={searchTerm}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setSearchTerm(e.target.value)}
          onKeyDown={(e: React.KeyboardEvent<HTMLTextAreaElement>) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSearch();
            }
          }}
        />
        <div className="flex items-center justify-between pt-2 border-t border-border/50">
          <div className="flex items-center space-x-2">
            <Switch
              id="analyze-mode"
              checked={isAnalyzeMode}
              onCheckedChange={setIsAnalyzeMode}
              aria-label="Toggle Analyze mode"
            />
            <Label htmlFor="analyze-mode" className="text-sm text-muted-foreground cursor-pointer">
              Analyze
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon" aria-label="Voice search" onClick={handleMicClick}>
              <Mic className="h-5 w-5 text-muted-foreground" />
            </Button>
            <RainbowButton onClick={handleSearch} aria-label="Submit" className="rounded-md p-2">
              <ArrowUp className="h-5 w-5" />
            </RainbowButton>
          </div>
        </div>
      </div>
    </div>
  );
} 