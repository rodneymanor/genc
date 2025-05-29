import React from 'react';

interface StylishHeadlineProps {
  firstName?: string | null; // Make firstName optional
}

export default function StylishHeadline({ firstName }: StylishHeadlineProps) {
  const welcomeName = firstName || 'Creator'; // Fallback to 'Creator' if no name

  return (
    <div className="w-full pb-4 flex flex-col items-center justify-center">
      <div className="text-[36px] font-bold text-center text-[hsl(var(--muted-foreground))] leading-tight">
        What will you script today?
      </div>
    </div>
  );
} 