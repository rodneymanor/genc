'use client';

import React from 'react';
import Image from 'next/image';
// import { AspectRatio } from "@/components/ui/aspect-ratio"; // If you add this Shadcn component
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { PlayCircle, Youtube, Instagram, Clapperboard } from 'lucide-react'; // Changed MessageSquare to Clapperboard
import { VideoType } from '@/contexts/AppContext'; // Changed to @/ alias
// Import useAppContext to set selected video

interface VideoCardProps {
  video: VideoType;
  onClick: () => void;
}

const PlatformIcons: Record<VideoType['sourcePlatform'], JSX.Element> = {
  YouTube: <Youtube size={18} className="mr-1" />,
  Instagram: <Instagram size={18} className="mr-1" />,
  TikTok: <Clapperboard size={18} className="mr-1" /> // Changed to Clapperboard
};

const VideoCard: React.FC<VideoCardProps> = ({ video, onClick }) => {
  return (
    <Card className="w-full max-w-sm overflow-hidden cursor-pointer hover:shadow-lg transition-shadow duration-300" onClick={onClick}>
      <CardHeader className="p-0 relative">
        <div className="w-full aspect-[9/16] relative">
          <Image
            src={video.thumbnailUrl || '/placeholder-thumbnail.jpg'} // Provide a fallback placeholder
            alt={video.title}
            layout="fill"
            objectFit="cover"
            className="transition-all duration-200 group-hover:brightness-[0.8] ease-out"
          />
        </div>
        {video.duration && (
          <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded">
            {video.duration}
          </div>
        )}
        <div className="absolute top-2 right-2 bg-black/70 text-white p-1 rounded-full">
          <PlayCircle size={24} />
        </div>
      </CardHeader>
      <CardContent className="p-3">
        <CardTitle className="text-md font-semibold leading-tight line-clamp-2 h-[3em]">
          {video.title}
        </CardTitle>
      </CardContent>
      <CardFooter className="p-3 pt-0 text-xs text-muted-foreground flex justify-between items-center">
        <div className="flex items-center">
          {PlatformIcons[video.sourcePlatform]}
          <span>{video.sourcePlatform}</span>
        </div>
        {/* Additional info like views or upload date could go here */}
      </CardFooter>
    </Card>
  );
};

export default VideoCard; 