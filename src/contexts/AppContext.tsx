'use client';

import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback } from 'react';
import { fetchVideoDetailsFromRapidAPI } from '@/lib/videoApi'; // Import the fetch function

// Unified VideoInfo interface
export interface VideoInfo {
  id: string;
  title: string;
  sourceUrl: string; // The original social media URL (used for fetching/transcription)
  embedUrl?: string;  // Direct video embed link if available (for player)
  thumbnailUrl?: string;
  description?: string;
  sourceSite?: 'youtube' | 'tiktok' | 'instagram' | 'facebook' | 'unknown';
  duration?: string; // e.g., "2:35"
  authorUsername?: string; // Added authorUsername
  audioUrl?: string; // Added for direct audio link
  // Add other relevant fields from RapidAPI or other sources
}

// Define the shape of your context state
interface AppState {
  currentView: 'discovery' | 'split';
  selectedVideo: VideoInfo | null; // Changed from VideoType
  searchQuery: string; 
  selectedCategory: string | null;
  isProcessingUrl: boolean; 
  processingUrlError: string | null; 
  hasJustProcessedNewUrl: boolean; // New state
}

// Define the shape of your context value (state + setters)
interface AppContextType extends AppState {
  setCurrentView: (view: 'discovery' | 'split') => void;
  setSelectedVideo: (video: VideoInfo | null) => void; // Changed from VideoType
  setSearchQuery: (query: string) => void;
  setSelectedCategory: (category: string | null) => void;
  setIsProcessingUrl: (isProcessing: boolean) => void; 
  setProcessingUrlError: (error: string | null) => void; 
  setHasJustProcessedNewUrl: (processed: boolean) => void; // New setter

  // Transcription state
  isTranscribing: boolean;
  setIsTranscribing: (isTranscribing: boolean) => void;
  transcriptionProgress: TranscriptionProgress;
  setTranscriptionProgress: (progress: Partial<TranscriptionProgress>) => void;
  transcriptText: string | null;
  setTranscriptText: (text: string | null) => void;
  transcriptionError: string | null;
  setTranscriptionError: (error: string | null) => void;
  triggerTranscription: (video?: VideoInfo) => Promise<void>;

  // New function for processing URLs
  processNewUrl: (url: string) => Promise<void>;
}

// Create the context with a default undefined value
const AppContext = createContext<AppContextType | undefined>(undefined);

// Define the provider component
interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [currentView, setCurrentView] = useState<'discovery' | 'split'>('discovery');
  const [selectedVideo, setSelectedVideoState] = useState<VideoInfo | null>(null); // Changed from VideoType
  const [searchQuery, setSearchQueryState] = useState<string>('');
  const [selectedCategory, setSelectedCategoryState] = useState<string | null>(null);
  const [isProcessingUrl, setIsProcessingUrlState] = useState<boolean>(false); // Initialize new state
  const [processingUrlError, setProcessingUrlErrorState] = useState<string | null>(null); // Initialize new state
  const [hasJustProcessedNewUrl, setHasJustProcessedNewUrlState] = useState<boolean>(false); // New state initialized

  // New transcription state
  const [isTranscribing, setIsTranscribingState] = useState<boolean>(false);
  const [transcriptionProgress, setTranscriptionProgressState] = useState<TranscriptionProgress>({
    downloading: false,
    transcribing: false,
  });
  const [transcriptText, setTranscriptTextState] = useState<string | null>(null);
  const [transcriptionError, setTranscriptionErrorState] = useState<string | null>(null);

  // New states for robust URL processing
  const [lastSubmittedUrl, setLastSubmittedUrl] = useState<string | null>(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsInitialLoad(false), 500); // Give a bit more time
    return () => clearTimeout(timer);
  }, []);

  const setSelectedVideo = useCallback((video: VideoInfo | null) => {
    setSelectedVideoState(video);
  }, []);

  const setSearchQuery = useCallback((query: string) => {
    setSearchQueryState(query);
  }, []);

  const setSelectedCategory = useCallback((category: string | null) => {
    setSelectedCategoryState(category);
  }, []);

  const setIsProcessingUrl = useCallback((isProcessing: boolean) => {
    setIsProcessingUrlState(isProcessing);
  }, []);

  const setProcessingUrlError = useCallback((error: string | null) => {
    setProcessingUrlErrorState(error);
  }, []);

  const setHasJustProcessedNewUrl = useCallback((processed: boolean) => {
    setHasJustProcessedNewUrlState(processed);
  }, []);

  const setIsTranscribing = useCallback((isTranscribing: boolean) => {
    setIsTranscribingState(isTranscribing);
  }, []);

  const setTranscriptText = useCallback((text: string | null) => {
    setTranscriptTextState(text);
  }, []);

  const setTranscriptionError = useCallback((error: string | null) => {
    setTranscriptionErrorState(error);
  }, []);

  const setTranscriptionProgress = useCallback((progressUpdate: Partial<TranscriptionProgress>) => {
    setTranscriptionProgressState(prev => ({ ...prev, ...progressUpdate }));
  }, []);

  const resetTranscriptionState = useCallback(() => {
    setIsTranscribing(false);
    setTranscriptionProgress({ downloading: false, transcribing: false });
    setTranscriptText(null);
    setTranscriptionError(null);
  }, [setIsTranscribing, setTranscriptionProgress, setTranscriptText, setTranscriptionError]);

  const processNewUrl = useCallback(async (url: string) => {
    if (!url || url.trim() === "") {
      setProcessingUrlError("Please enter a valid video URL.");
      return;
    }

    if (isProcessingUrl && url === lastSubmittedUrl) {
      console.log("[AppContext] URL is already being processed:", url);
      return;
    }
    // If the same URL previously errored, and we are not in initial load, allow retry by clearing error.
    // However, if it is initialLoad, we might want to be more restrictive.
    if (processingUrlError && url === lastSubmittedUrl) {
        console.log("[AppContext] This URL previously resulted in an error, proceeding with caution:", url);
        // Continue processing - we'll give it another try
    }

    console.log("[AppContext] Processing new URL:", url);
    setLastSubmittedUrl(url);
    setIsProcessingUrl(true);
    setProcessingUrlError(null);
    setSelectedVideo(null); 
    resetTranscriptionState();
    setHasJustProcessedNewUrl(false);
    setCurrentView('split'); // Switch to split view when a new URL is processed

    try {
      const videoDetails = await fetchVideoDetailsFromRapidAPI(url);
      if (videoDetails) {
        console.log("[AppContext] Video details fetched:", videoDetails.title);
        setSelectedVideo(videoDetails);
        setHasJustProcessedNewUrl(true);
      } else {
        console.warn("[AppContext] Failed to fetch video details. URL might be invalid or service unavailable.");
        setProcessingUrlError("Failed to fetch video details. The URL may be invalid, or the service is temporarily unavailable.");
        setHasJustProcessedNewUrl(false);
      }
    } catch (error: any) {
      console.error("[AppContext] Error during processNewUrl:", error);
      setProcessingUrlError(error.message || "An unexpected error occurred while fetching video details.");
      setHasJustProcessedNewUrl(false);
    } finally {
      setIsProcessingUrl(false);
    }
  }, [isProcessingUrl, processingUrlError, lastSubmittedUrl, resetTranscriptionState, setIsProcessingUrl, setProcessingUrlError, setSelectedVideo, setHasJustProcessedNewUrl, setCurrentView]);

  const triggerTranscription = useCallback(async (videoToTranscribeParam?: VideoInfo) => { 
    const currentVideo = videoToTranscribeParam || selectedVideo;

    if (!currentVideo || !currentVideo.sourceUrl) {
      console.error("[AppContext] Cannot trigger transcription: missing video or sourceUrl.", { currentVideo });
      setTranscriptionError("Cannot trigger transcription: Video information is missing.");
      if(videoToTranscribeParam) setHasJustProcessedNewUrl(false);
      return;
    }
    
    console.log("[AppContext] Triggering transcription for URL:", currentVideo.sourceUrl, "from video ID:", currentVideo.id);
    resetTranscriptionState(); 
    setIsTranscribing(true);
    setTranscriptionProgress({ downloading: true });
    setHasJustProcessedNewUrl(false); 

    try {
      const response = await fetch('/api/transcribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoUrl: currentVideo.sourceUrl }),
      });

      setTranscriptionProgress({ downloading: false, transcribing: true });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Failed to parse error from transcription API."}));
        throw new Error(errorData.error || `Transcription API request failed: ${response.status}`);
      }

      const result = await response.json();
      setTranscriptText(result.transcript);
      setTranscriptionProgress({ transcribing: false });
      console.log("[AppContext] Transcription successful for:", currentVideo.title);
    } catch (error: any) {
      console.error('[AppContext] Transcription failed:', error);
      setTranscriptionError(error.message || 'Unknown error during transcription.');
      setTranscriptionProgress({ downloading: false, transcribing: false });
    } finally {
      setIsTranscribing(false);
    }
  }, [selectedVideo, resetTranscriptionState, setIsTranscribing, setTranscriptionProgress, setTranscriptText, setTranscriptionError, setHasJustProcessedNewUrl]);
  
  useEffect(() => {
    setSelectedVideo(null);
    setIsProcessingUrlState(false);
    setProcessingUrlErrorState(null);
    resetTranscriptionState();
    setHasJustProcessedNewUrlState(false);
    setLastSubmittedUrl(null);
  }, [resetTranscriptionState]); 

  // Effect to automatically trigger transcription when a new video is successfully processed
  useEffect(() => {
    if (selectedVideo && hasJustProcessedNewUrl && !isTranscribing && !transcriptionError) {
      console.log("[AppContext] Conditions met for triggering transcription for video:", selectedVideo.title);
      triggerTranscription(selectedVideo);
    }
  }, [selectedVideo, hasJustProcessedNewUrl, isTranscribing, transcriptionError, triggerTranscription]);

  return (
    <AppContext.Provider
      value={{
        currentView,
        setCurrentView,
        selectedVideo,
        setSelectedVideo,
        searchQuery,
        setSearchQuery,
        selectedCategory,
        setSelectedCategory,
        isProcessingUrl, // Provide new state
        setIsProcessingUrl, // Provide new setter
        processingUrlError, // Provide new state
        setProcessingUrlError, // Provide new setter
        hasJustProcessedNewUrl, // Provide new state
        setHasJustProcessedNewUrl, // Provide new setter
        // Transcription values
        isTranscribing,
        setIsTranscribing,
        transcriptionProgress,
        setTranscriptionProgress,
        transcriptText,
        setTranscriptText,
        transcriptionError,
        setTranscriptionError,
        triggerTranscription,
        processNewUrl, // Expose the new function
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

// Custom hook to use the AppContext
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

interface TranscriptionProgress {
  downloading: boolean;
  transcribing: boolean;
} 