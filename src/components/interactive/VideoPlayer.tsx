'use client';

import React from 'react';
import { useAppContext, VideoInfo } from '@/contexts/AppContext';
import { Loader2, AlertTriangle, Film } from 'lucide-react';

// Video URL parsing utility functions
function convertYouTubeShortsToEmbed(url: string): string {
  const videoIdRegex = /(?:shorts\/|v=|\/v\/|youtu\.be\/|\/embed\/|\/v=|\/e\/|watch\?v=)([^#\&\?\n]+)/;
  const match = url.match(videoIdRegex);
  
  if (match && match[1]) {
    return `https://www.youtube.com/embed/${match[1]}?controls=1&showinfo=0&rel=0`;
  }
  
  return url;
}

function convertTikTokToEmbed(url: string): string {
  const tikTokRegex = /tiktok\.com\/@[\w.-]+\/video\/(\d+)/;
  const match = url.match(tikTokRegex);
  
  if (match && match[1]) {
    const videoId = match[1];
    return `https://www.tiktok.com/player/v1/${videoId}?controls=0&description=0&music_info=0`;
  }
  
  return url;
}

function convertInstagramToEmbed(url: string): string {
  if (url.includes('instagram.com/p/') || url.includes('instagram.com/reel/')) {
    const match = url.match(/instagram\.com\/(p|reel)\/([^\/\?#]+)/);
    if (match && match[2]) {
      const postCode = match[2];
      return `https://www.instagram.com/p/${postCode}/embed/`;
    }
  }
  
  return url;
}

interface VideoEmbedInfo {
  embedUrl: string;
  aspectRatio: string;
  isVertical: boolean;
  platform: string;
}

function parseVideoUrl(url: string): VideoEmbedInfo {
  let embedUrl = url;
  let aspectRatio = "16/9";
  let isVertical = false;
  let platform = "Other";
  
  // YouTube
  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    embedUrl = convertYouTubeShortsToEmbed(url);
    platform = "YouTube";
    
    // Check if it's a shorts video
    if (url.includes('/shorts/')) {
      aspectRatio = "9/16";
      isVertical = true;
    }
  } 
  // TikTok
  else if (url.includes('tiktok.com')) {
    embedUrl = convertTikTokToEmbed(url);
    platform = "TikTok";
    aspectRatio = "9/16";
    isVertical = true;
  } 
  // Instagram
  else if (url.includes('instagram.com')) {
    embedUrl = convertInstagramToEmbed(url);
    platform = "Instagram";
    
    // Check if it's a reel (usually vertical)
    if (url.includes('/reel/')) {
      aspectRatio = "9/16";
      isVertical = true;
    } else {
      // Regular posts are often square
      aspectRatio = "1/1";
    }
  }
  
  return { 
    embedUrl,
    aspectRatio,
    isVertical,
    platform
  };
}

const VideoPlayer = () => {
  const { selectedVideo, isProcessingUrl, processingUrlError, currentView } = useAppContext();

  if (currentView === 'split') {
    if (isProcessingUrl) {
      return (
        <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-muted rounded-lg shadow-lg">
          <Loader2 className="h-10 w-10 animate-spin text-muted-foreground mb-3" />
          <p className="text-muted-foreground">Loading video...</p>
        </div>
      );
    }
    if (processingUrlError && !selectedVideo) {
      return (
        <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-muted rounded-lg shadow-lg text-center">
          <AlertTriangle className="h-10 w-10 text-destructive mb-3" />
          <p className="text-destructive-foreground font-semibold">Error Loading Video</p>
          <p className="text-sm text-muted-foreground">There was an issue fetching the video details.</p>
        </div>
      );
    }
  }

  if (!selectedVideo) {
    return (
      <div className="w-full flex flex-col items-center justify-center p-4">
        <div className="w-full aspect-[9/16] bg-muted flex flex-col items-center justify-center text-muted-foreground rounded-lg overflow-hidden shadow-lg">
          <Film size={48} className="mb-3 opacity-70" />
          <p className="font-semibold">Video Player</p>
        </div>
        <div className="mt-3 text-center w-full max-w-2xl">
          <h3 className="text-lg font-semibold text-muted-foreground">Welcome!</h3>
          <p className="text-sm text-muted-foreground">Submit a video URL to start, or select from recommendations if available.</p>
        </div>
      </div>
    );
  }

  // Get the video URLs from the selectedVideo object
  const videoToProcess = selectedVideo.sourceUrl || selectedVideo.embedUrl || '';
  const { embedUrl, aspectRatio, isVertical, platform: detectedPlatform } = parseVideoUrl(videoToProcess);
  
  let playerElement;
  const sourcePlatform = selectedVideo.sourceSite || detectedPlatform.toLowerCase();

  if (detectedPlatform === 'YouTube' || sourcePlatform === 'youtube') {
    playerElement = (
      <iframe
        key={selectedVideo.id + '-youtube'}
        title={selectedVideo.title || 'YouTube Video'}
        width="100%"
        height="100%"
        src={embedUrl}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="border-0"
      ></iframe>
    );
  } else if (detectedPlatform === 'TikTok' || sourcePlatform === 'tiktok') {
    playerElement = (
      <iframe
        key={selectedVideo.id + '-tiktok'}
        title={selectedVideo.title || 'TikTok Video'}
        width="100%"
        height="100%"
        src={embedUrl}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="border-0"
      ></iframe>
    );
  } else if (detectedPlatform === 'Instagram' || sourcePlatform === 'instagram') {
    playerElement = (
      <iframe
        key={selectedVideo.id + '-instagram'}
        title={selectedVideo.title || 'Instagram Post'}
        width="100%"
        height="100%"
        src={embedUrl}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="border-0"
      ></iframe>
    );
  } else {
    // Default video player for direct video URLs or unsupported platforms
    const videoUrl = selectedVideo.embedUrl || '';
    playerElement = (
      <video
        key={selectedVideo.id + '-video'}
        title={selectedVideo.title || 'Video'}
        width="100%"
        height="100%"
        controls
        autoPlay
        src={videoUrl}
        className="rounded-lg bg-black"
      >
        Your browser does not support the video tag.
      </video>
    );
  }

  return (
    <div className="w-full h-full p-1 sm:p-2 md:p-4 flex flex-col items-center">
      <div className={`w-full max-w-md ${isVertical ? 'aspect-[9/16]' : 'aspect-video'} bg-black rounded-lg overflow-hidden shadow-lg mb-3`}>
        {playerElement}
      </div>
      <div className="w-full max-w-md text-left">
        <h2 className="text-xl lg:text-2xl font-semibold mb-1 truncate" title={selectedVideo.title}>{selectedVideo.title}</h2>
        <div className="flex items-center text-xs sm:text-sm text-muted-foreground mb-1">
          <span>Source: {selectedVideo.sourceSite || detectedPlatform}</span>
          {selectedVideo.duration && <span className="mx-2">•</span>}
          {selectedVideo.duration && <span>Duration: {selectedVideo.duration}</span>}
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer; 