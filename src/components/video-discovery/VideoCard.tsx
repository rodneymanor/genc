'use client';

import React from 'react';
import Image from 'next/image';
// import { AspectRatio } from "@/components/ui/aspect-ratio"; // If you add this Shadcn component
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { PlayCircle, Youtube, Instagram, Clapperboard, Eye, Clock } from 'lucide-react'; // Changed MessageSquare to Clapperboard
import { VideoInfo } from '@/contexts/AppContext'; // Changed to @/ alias
// Import useAppContext to set selected video
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface VideoCardProps {
  video: VideoInfo;
  onClick: () => void;
}

const PlatformIcons: Record<NonNullable<VideoInfo['sourceSite']>, JSX.Element> = {
  youtube: <Youtube size={18} className="mr-1" />,
  instagram: <Instagram size={18} className="mr-1" />,
  tiktok: <Clapperboard size={18} className="mr-1" />, // Using Clapperboard for TikTok
  facebook: <Clapperboard size={18} className="mr-1" />, // Using Clapperboard for Facebook
  unknown: <Clapperboard size={18} className="mr-1" />, // Fallback icon
};

// Helper function to format numbers (e.g., 1234 -> 1.2K)
const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
};

// Helper function to format duration
const formatDuration = (duration: string): string => {
  // If duration is already formatted (e.g., "2:35"), return as is
  if (duration.includes(':')) {
    return duration;
  }
  // If it's in seconds, convert to MM:SS format
  const totalSeconds = parseInt(duration);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

const VideoCard: React.FC<VideoCardProps> = ({ video, onClick }) => {
  return (
    <Card className="group cursor-pointer overflow-hidden transition-all duration-300 hover:shadow-lg hover:scale-[1.02] border-border bg-card" onClick={onClick}>
      <CardContent className="p-0">
        <div className="relative">
          <div className="aspect-video overflow-hidden">
            <Image
              src={video.thumbnailUrl || '/placeholder-image.jpg'}
              alt={video.title}
              width={300}
              height={200}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </div>
          {video.duration && (
            <div className="absolute bottom-2 right-2 bg-background/80 text-foreground text-xs px-1.5 py-0.5 rounded backdrop-blur-sm">
              {formatDuration(video.duration)}
            </div>
          )}
          <div className="absolute top-2 right-2 bg-background/80 text-foreground p-1 rounded-full backdrop-blur-sm">
            <PlayCircle size={24} />
          </div>
          {video.sourceSite && (
            <div className="absolute top-2 left-2">
              <Badge variant="secondary" className="bg-background/80 text-foreground backdrop-blur-sm">
                {PlatformIcons[video.sourceSite]}
                {video.sourceSite.charAt(0).toUpperCase() + video.sourceSite.slice(1)}
              </Badge>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="p-3 pt-0 text-xs text-muted-foreground flex justify-between items-center">
        <div className="flex items-center">
          {video.sourceSite && PlatformIcons[video.sourceSite]}
          <span>{video.sourceSite || 'Unknown'}</span>
        </div>
        {/* Additional info like views or upload date could go here */}
      </CardFooter>
    </Card>
  );
};

export default VideoCard; 