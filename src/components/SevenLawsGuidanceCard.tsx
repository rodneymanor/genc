import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SevenLawsGuidanceCardProps {
  lawName: string;
  guidanceText: string | React.ReactNode;
  isVisible?: boolean;
  onDismiss?: () => void;
  className?: string;
}

const SevenLawsGuidanceCard: React.FC<SevenLawsGuidanceCardProps> = ({
  lawName,
  guidanceText,
  isVisible = true,
  onDismiss,
  className,
}) => {
  // Don't render if not visible
  if (!isVisible) {
    return null;
  }

  return (
    <Card
      className={cn(
        'border-primary/20 bg-primary/5 shadow-md transition-all duration-200 hover:shadow-lg',
        'border-l-4 border-l-primary',
        className
      )}
    >
      <CardHeader className={cn('pb-3', onDismiss && 'flex-row items-start justify-between space-y-0')}>
        <div className="flex-1">
          <CardTitle className="text-lg font-semibold text-primary flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-sm font-bold">
              {lawName.charAt(0).toUpperCase()}
            </span>
            {lawName}
          </CardTitle>
        </div>
        
        {onDismiss && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onDismiss}
            className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
            aria-label={`Dismiss ${lawName} guidance`}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </CardHeader>

      <CardContent className="pt-0">
        <div className="text-sm text-muted-foreground leading-relaxed">
          {typeof guidanceText === 'string' ? (
            <p>{guidanceText}</p>
          ) : (
            guidanceText
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SevenLawsGuidanceCard; 