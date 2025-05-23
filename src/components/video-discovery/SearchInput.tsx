'use client';

import React, { useState, useEffect } from 'react';
import { useAppContext, VideoInfo } from '@/contexts/AppContext';
import { useAiWriterContext } from '@/contexts/AiWriterContext';
import ThemedInputArea from '@/components/interactive/ThemedInputArea';
import { useRouter } from 'next/navigation';

const SearchInput = () => {
  console.log("[SearchInput] Component rendered");
  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [activeSegment, setActiveSegment] = useState('analyzer');
  const router = useRouter();

  const {
    // setCurrentView,
    // selectedVideo,
    // setSelectedVideo,
    // isProcessingUrl,
    // setIsProcessingUrl,
    // setProcessingUrlError,
    // triggerTranscription,
    // isTranscribing,
    // transcriptText,
    // hasJustProcessedNewUrl,
    // setHasJustProcessedNewUrl,
  } = useAppContext();

  const {
    setIsAiWriterSearchActive,
    triggerSearch,
    setVideoIdea
  } = useAiWriterContext();

  useEffect(() => {
    if (activeSegment === 'aiwriter') {
      setIsAiWriterSearchActive(true);
    } else {
      setIsAiWriterSearchActive(false);
    }
  }, [activeSegment, setIsAiWriterSearchActive]);

  const isValidURL = (string: string): boolean => {
    const trimmedString = string.trim();
    if (!trimmedString) return false;

    try {
      const urlToTest = trimmedString.includes('://') ? trimmedString : `https://${trimmedString}`;
      const url = new URL(urlToTest);
      return url.protocol !== "" && url.hostname.includes('.') && url.hostname.split('.').pop()!.length >= 2;
    } catch (err) {
      return false;
    }
  };

  const getPlatformFromUrl = (url: string): 'tiktok' | 'instagram' | 'youtube' | 'UnsupportedYouTube' | 'unknown' => {
    if (url.includes('tiktok.com')) return 'tiktok';
    if (url.includes('instagram.com')) return 'instagram';
    if (url.includes('youtube.com/shorts/')) return 'youtube';
    if (url.includes('youtube.com/watch') || url.includes('youtu.be/')) return 'UnsupportedYouTube';
    return 'unknown';
  };

  const handleProcessUrl = async () => {
    console.log("[SearchInput] handleProcessUrl CALLED (for video URL analysis)");
    const trimmedUrl = inputValue.trim();
    console.log("[SearchInput] trimmedUrl:", trimmedUrl);

    if (!trimmedUrl) {
      setError('Please enter a URL.');
      return;
    }

    if (!isValidURL(trimmedUrl)) {
      setError('Invalid URL format. Please enter a valid video URL.');
      return;
    }

    const platformOrValidation = getPlatformFromUrl(trimmedUrl);
    console.log("[SearchInput] Detected platform/validation:", platformOrValidation);

    if (platformOrValidation === 'UnsupportedYouTube') {
      setError('Only YouTube Shorts, Instagram Reels, and TikTok videos are supported.');
      return;
    }

    if (platformOrValidation === 'unknown') {
        setError('Unsupported URL. Please enter a TikTok, Instagram Reels, or YouTube Shorts video URL.');
        return;
    }

    console.log("[SearchInput] Validation passed. Navigating to analysis page with URL:", trimmedUrl);
    setError(null);
    router.push(`/analysis?videoUrl=${encodeURIComponent(trimmedUrl)}`);
  };

  const handleAiWriterSearch = async () => {
    console.log("[SearchInput] handleAiWriterSearch CALLED");
    const idea = inputValue.trim();
    if (!idea) {
      setError('Please enter a video idea.');
      return;
    }
    setError(null);
    setVideoIdea(idea);
    await triggerSearch(idea);
    router.push('/ai-writer');
  };

  const handleSubmit = () => {
    if (activeSegment === 'aiwriter') {
      handleAiWriterSearch();
    } else {
      handleProcessUrl();
    }
  };

  const onFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    console.log("[SearchInput] onFormSubmit triggered by form");
    event.preventDefault();
    handleSubmit();
  };

  return (
    <div className="w-full space-y-3">
      <form onSubmit={onFormSubmit} className="flex items-start w-full">
        <div className="w-full">
          <ThemedInputArea
            initialValue={inputValue}
            onValueChange={(value) => {
              console.log("[SearchInput] Input onChange:", value);
              setInputValue(value);
              if (error) setError(null);

              if (value.trim() === '') {
                // Keep current segment or default to analyzer if input is cleared
                // setActiveSegment('analyzer'); // Or let it be sticky
              } else if (isValidURL(value)) {
                setActiveSegment('analyzer');
              } else {
                setActiveSegment('aiwriter');
              }
            }}
            onSubmit={handleSubmit}
            rootClassName={`w-full ${error ? 'border-destructive' : ''}`}
            bgColor="background"
            accentColor="primary"
            borderColor={error ? "destructive" : "input"}
            textareaId={activeSegment === 'aiwriter' ? "ai-writer-idea-input" : "video-url-input"}
            showSegmentedControls={true}
            activeSegment={activeSegment}
            onSegmentChange={setActiveSegment}
          />
          {error && <p className="mt-1.5 text-xs text-destructive text-left">{error}</p>}
        </div>
      </form>
    </div>
  );
};

export default SearchInput; 