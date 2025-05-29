import React from 'react';
import { cn } from '@/lib/utils';

type LoadingSize = 'sm' | 'md' | 'lg';

interface LoadingIndicatorProps {
  message?: string;
  size?: LoadingSize;
  className?: string;
}

const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({
  message,
  size = 'md',
  className,
}) => {
  // Define spinner size configurations
  const spinnerSizes = {
    sm: 'h-5 w-5 border-2',
    md: 'h-8 w-8 border-[3px]',
    lg: 'h-12 w-12 border-4',
  };

  // Define text size configurations to match spinner
  const textSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  // Define spacing between spinner and text
  const spacing = {
    sm: 'gap-2',
    md: 'gap-3',
    lg: 'gap-4',
  };

  return (
    <div
      className={cn(
        'flex items-center justify-center',
        spacing[size],
        className
      )}
    >
      {/* Spinner */}
      <div
        className={cn(
          'animate-spin rounded-full border-primary border-t-transparent',
          spinnerSizes[size]
        )}
        role="status"
        aria-label={message || 'Loading'}
      />
      
      {/* Message */}
      {message && (
        <span
          className={cn(
            'text-muted-foreground font-medium',
            textSizes[size]
          )}
        >
          {message}
        </span>
      )}
    </div>
  );
};

export default LoadingIndicator; 