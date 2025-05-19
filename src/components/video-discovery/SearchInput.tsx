'use client';

import React, { useState, useEffect } from 'react';
import { useAppContext, VideoInfo } from '@/contexts/AppContext';
import { fetchVideoDetailsFromRapidAPI } from '@/lib/videoApi';
import ThemedInputArea from '@/components/interactive/ThemedInputArea';

const SearchInput = () => {
  console.log("[SearchInput] Component rendered");
  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState<string | null>(null);
  const {
    setCurrentView,
    selectedVideo,
    setSelectedVideo,
    isProcessingUrl,
    setIsProcessingUrl,
    setProcessingUrlError,
    triggerTranscription,
    isTranscribing,
    transcriptText,
    hasJustProcessedNewUrl,
    setHasJustProcessedNewUrl,
  } = useAppContext();

  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch (_) {
      return false;
    }
  };

  const getPlatformFromUrl = (url: string): VideoInfo['sourceSite'] | 'UnsupportedYouTube' | 'unknown' => {
    if (url.includes('tiktok.com')) return 'tiktok';
    if (url.includes('instagram.com')) return 'instagram';
    if (url.includes('youtube.com/shorts/')) return 'youtube';
    if (url.includes('youtube.com/watch') || url.includes('youtu.be/')) return 'UnsupportedYouTube';
    return 'unknown';
  };

  const handleProcessUrl = async () => {
    console.log("[SearchInput] handleProcessUrl CALLED");
    const trimmedUrl = inputValue.trim();
    console.log("[SearchInput] trimmedUrl:", trimmedUrl);

    if (!trimmedUrl) {
      setError('Please enter a URL.');
      console.log("[SearchInput] Error: No trimmedUrl");
      return;
    }

    if (!isValidUrl(trimmedUrl)) {
      setError('Invalid URL format. Please enter a valid video URL.');
      console.log("[SearchInput] Error: Invalid URL format");
      return;
    }

    const platformOrValidation = getPlatformFromUrl(trimmedUrl);
    console.log("[SearchInput] Detected platform/validation:", platformOrValidation);

    if (platformOrValidation === 'UnsupportedYouTube') {
      setError('Only YouTube Shorts, Instagram Reels, and TikTok videos are supported. Please enter a different YouTube URL.');
      console.log("[SearchInput] Error: Unsupported YouTube video (not a Short)");
      return;
    }

    if (platformOrValidation === 'unknown' && !trimmedUrl.includes('http')) {
        setError('Unsupported URL. Please enter a TikTok, Instagram, or YouTube Shorts video URL.');
        console.log("[SearchInput] Error: Unsupported platform or not a URL");
        return;
    }

    const platform = platformOrValidation as VideoInfo['sourceSite'];

    console.log("[SearchInput] Validation passed. Proceeding to process URL with platform:", platform);
    setError(null);
    setProcessingUrlError(null);
    setSelectedVideo(null);
    setIsProcessingUrl(true);
    setCurrentView('split');

    try {
      console.log("[SearchInput] Calling fetchVideoDetailsFromRapidAPI with URL:", trimmedUrl, "and platform:", platform);
      const videoDetails = await fetchVideoDetailsFromRapidAPI(trimmedUrl, platform);
      
      console.log("[SearchInput] Raw videoDetails from fetchVideoDetailsFromRapidAPI:", JSON.stringify(videoDetails, null, 2));

      if (videoDetails && videoDetails.id && videoDetails.sourceUrl) {
        console.log("[SearchInput] videoDetails are valid. Calling setSelectedVideo with:", JSON.stringify(videoDetails, null, 2));
        setSelectedVideo(videoDetails);
        setHasJustProcessedNewUrl(true);
        
        console.log("[SearchInput] Directly calling triggerTranscription with new videoDetails.");
        triggerTranscription(videoDetails);

      } else {
        console.error("[SearchInput] Failed to fetch valid video details or missing id/sourceUrl. Details:", JSON.stringify(videoDetails, null, 2));
        setProcessingUrlError('Failed to fetch comprehensive video details. The URL might be invalid, private, or the service is temporarily down.');
        setIsProcessingUrl(false);
        setHasJustProcessedNewUrl(false);
      }
    } catch (fetchError) {
      console.error("[SearchInput] Error fetching video details from API:", fetchError);
      setProcessingUrlError('An unexpected error occurred while fetching video details.');
      setIsProcessingUrl(false);
      setHasJustProcessedNewUrl(false);
    }
  };

  useEffect(() => {
    console.log("[SearchInput useEffect - Monitor] selectedVideo:", selectedVideo, "hasJustProcessedNewUrl:", hasJustProcessedNewUrl, "isTranscribing:", isTranscribing, "transcriptText:", transcriptText);
  }, [selectedVideo, hasJustProcessedNewUrl, isTranscribing, transcriptText]);
  
  useEffect(() => {
    if (isProcessingUrl && (selectedVideo || error)) {
      console.log("[SearchInput useEffect] Clearing processing state");
      setIsProcessingUrl(false);
    }
  }, [isProcessingUrl, selectedVideo, error, setIsProcessingUrl]);
  
  const onFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    console.log("[SearchInput] onFormSubmit triggered by form");
    event.preventDefault();
    handleProcessUrl();
  };

  const onButtonClick = () => {
    console.log("[SearchInput] Process button CLICKED");
    handleProcessUrl();
  };

  return (
    <div className="w-full">
      <form onSubmit={onFormSubmit} className="flex items-start w-full">
        <div className="w-full">
          <ThemedInputArea
            textareaPlaceholder="Enter TikTok, Instagram, or YouTube Shorts URL..."
            initialValue={inputValue}
            onValueChange={(value) => {
              console.log("[SearchInput] Input onChange:", value);
              setInputValue(value);
              if (error) setError(null);
            }}
            onSubmit={handleProcessUrl}
            rootClassName={`w-full ${error ? 'border-destructive' : ''}`}
            bgColor="background"
            accentColor="primary"
            borderColor={error ? "destructive" : "input"}
            textareaId="video-url-input"
          />
          {error && <p className="mt-1.5 text-xs text-destructive text-left">{error}</p>}
        </div>
      </form>
    </div>
  );
};

export default SearchInput; 