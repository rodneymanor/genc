'use client';
import React from 'react';
import { Button } from '@/components/ui/button';
import { usePathname } from 'next/navigation';
import { useTopBar } from './TopBarProvider';

const TopBar: React.FC = () => {
  const pathname = usePathname();
  const { title: contextTitle, contextualButtons, recordButton, collapseButton } = useTopBar();

  // Get contextual title based on current path if not provided by context
  const getPageTitle = (): string => {
    if (contextTitle) return contextTitle;
    if (!pathname) return 'Dashboard';

    switch (pathname) {
      case '/':
        return 'Home';
      case '/ai-writer':
        return 'AI Writer';
      case '/voice':
        return 'Voice Lab';
      case '/inspiration':
        return 'Inspiration';
      case '/tone-studio':
        return 'Tone Studio';
      case '/analysis':
        return 'Analysis';
      case '/settings':
        return 'Settings';
      case '/settings/topics':
        return 'Topics';
      case '/settings/account':
        return 'Account';
      case '/profile':
        return 'Profile';
      default:
        // Handle dynamic routes
        if (pathname.startsWith('/analyze/')) {
          return 'Analysis Result';
        }
        if (pathname.startsWith('/script/')) {
          return 'Script Details';
        }
        if (pathname.startsWith('/ai-writer/')) {
          return 'Script Editor';
        }
        if (pathname.startsWith('/settings/')) {
          return 'Settings';
        }
        return 'Dashboard';
    }
  };

  return (
    <div className="sticky top-0 z-10 pl-3 pr-2 py-2 h-[45px] flex-shrink-0 w-full flex flex-row justify-between items-center border-b border-borderSecondary bg-background">
      <div className="flex items-center gap-2">
        <p className="text-sm px-1.5 lg:max-w-2xl md:max-w-md truncate w-full">
          {getPageTitle()}
        </p>
      </div>
      
      <div className="flex flex-row items-center gap-2 ml-auto">
        {/* Record Button - Show if provided by context */}
        {recordButton}
        
        {/* Collapse Button - Show if provided by context */}
        {collapseButton}
        
        {/* Contextual Buttons */}
        {contextualButtons}
        
        {/* Upgrade Button */}
        <Button className="inline-flex items-center relative gap-2 font-semibold justify-center whitespace-nowrap rounded-md text-sm ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground px-2 py-1 h-8">
          Upgrade
        </Button>
      </div>
    </div>
  );
};

export default TopBar; 