'use client';

import React from 'react';
import { Button } from '@/components/ui/button'; // Changed to @/ alias
import { ArrowLeft } from 'lucide-react';
import { useAppContext } from '@/contexts/AppContext'; // Changed to @/ alias

const BackButton = () => {
  const { currentView, setCurrentView } = useAppContext();

  if (currentView !== 'split') {
    return null; // Only show back button in split view
  }

  const handleBack = () => {
    setCurrentView('discovery');
    // Potentially clear selectedVideo as well, depending on desired UX
    // setSelectedVideo(null);
  };

  return (
    <Button variant="outline" size="icon" onClick={handleBack} className="fixed top-4 left-4 z-50">
      <ArrowLeft className="h-4 w-4" />
      <span className="sr-only">Back to Discovery</span>
    </Button>
  );
};

export default BackButton; 