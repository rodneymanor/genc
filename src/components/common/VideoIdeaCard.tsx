import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowRight } from "lucide-react";

interface VideoIdeaCardProps {
  title: string;
  description: string;
  category: string;
  onClick: () => void;
  className?: string;
}

const VideoIdeaCard: React.FC<VideoIdeaCardProps> = ({
  title,
  description,
  category,
  onClick,
  className = ""
}) => {
  return (
    <Card 
      className={`group hover:shadow-lg hover:border-primary/20 transition-all duration-300 cursor-pointer ${className}`}
      onClick={onClick}
    >
      <CardContent className="p-4 space-y-3">
        {/* Category Badge */}
        <div className="flex items-center gap-2">
          <div className="px-2 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full">
            {category}
          </div>
          <Sparkles className="w-3 h-3 text-primary opacity-70" />
        </div>
        
        {/* Title */}
        <h3 className="font-semibold text-base leading-tight group-hover:text-primary transition-colors">
          {title}
        </h3>
        
        {/* Description */}
        <p className="text-sm text-muted-foreground leading-relaxed">
          {description}
        </p>
        
        {/* Action Hint */}
        <div className="flex items-center justify-between pt-2">
          <span className="text-xs text-muted-foreground">Click to use</span>
          <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
        </div>
      </CardContent>
    </Card>
  );
};

export default VideoIdeaCard; 