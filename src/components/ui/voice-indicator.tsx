import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { VoiceProfileData } from '@/lib/firestoreService';
import { X, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface VoiceIndicatorProps {
  voiceProfile: VoiceProfileData;
  onDeactivate?: () => void;
  showDeactivate?: boolean;
}

export const VoiceIndicator: React.FC<VoiceIndicatorProps> = ({ 
  voiceProfile, 
  onDeactivate, 
  showDeactivate = true 
}) => {
  return (
    <div className="flex items-center gap-3 p-3 bg-muted/50 border border-border rounded-lg">
      <Avatar className="h-8 w-8">
        <AvatarImage 
          src={voiceProfile.sourceProfile.profileImage || undefined} 
          alt={voiceProfile.sourceProfile.username} 
        />
        <AvatarFallback className="text-xs">
          {voiceProfile.sourceProfile.username.slice(0, 2).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-foreground truncate">
            {voiceProfile.name}
          </p>
          <Badge variant="secondary" className="flex items-center gap-1 px-2 py-0.5">
            <Sparkles className="h-3 w-3" />
            <span className="text-xs">Using AI Voice</span>
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground">
          {voiceProfile.sourceProfile.username} • {voiceProfile.platform}
        </p>
      </div>
      
      {showDeactivate && onDeactivate && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onDeactivate}
          className="h-8 w-8 p-0 hover:bg-muted-foreground/10"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Deactivate voice</span>
        </Button>
      )}
    </div>
  );
}; 