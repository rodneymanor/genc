import React from 'react';
import Image from 'next/image';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Play } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CuratedVideoDisplayCardProps {
  videoThumbnailUrl: string;
  videoTitle: string;
  videoDescription: string;
  onClick: () => void;
  className?: string;
}

const CuratedVideoDisplayCard: React.FC<CuratedVideoDisplayCardProps> = ({
  videoThumbnailUrl,
  videoTitle,
  videoDescription,
  onClick,
  className,
}) => {
  return (
    <Card
      className={cn(
        'group cursor-pointer overflow-hidden transition-all duration-300',
        'hover:shadow-lg hover:scale-[1.02] hover:-translate-y-1',
        'border border-border/50 bg-card',
        className
      )}
      onClick={onClick}
    >
      {/* Video Thumbnail */}
      <div className="relative w-full aspect-video overflow-hidden">
        <Image
          src={videoThumbnailUrl}
          alt={videoTitle}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        
        {/* Play Button Overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="flex items-center justify-center w-16 h-16 bg-white/90 rounded-full shadow-lg backdrop-blur-sm">
            <Play className="h-6 w-6 text-primary ml-1" fill="currentColor" />
          </div>
        </div>
        
        {/* Gradient Overlay for better text readability */}
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black/60 to-transparent" />
      </div>

      {/* Content */}
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold line-clamp-2 group-hover:text-primary transition-colors duration-200">
          {videoTitle}
        </CardTitle>
      </CardHeader>

      <CardContent className="pt-0">
        <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
          {videoDescription}
        </p>
      </CardContent>
    </Card>
  );
};

export default CuratedVideoDisplayCard; 