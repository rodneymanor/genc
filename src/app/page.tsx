'use client';

import React from 'react';
import Image from 'next/image'; // Added Image import
import { useAppContext } from '@/contexts/AppContext'; // AppProvider removed from imports
import { Pencil, GraduationCap, Code, Briefcase, Lightbulb } from 'lucide-react'; // Import icons

// Import View Components
import SearchInput from '@/components/video-discovery/SearchInput';
import VideoPlayer from '@/components/interactive/VideoPlayer';
import VideoChat from '@/components/interactive/VideoChat';
// import AppHeader from '@/components/layout/AppHeader'; // AppHeader removed
import AppSidebar from '@/components/layout/AppSidebar'; // AppSidebar added
import MainContent from '@/components/layout/MainContent'; // MainContent added
import BackButton from '@/components/layout/BackButton';
import TabBar, { TabItem } from '@/components/interactive/TabBar'; // Import TabBar and TabItem

const DiscoveryView = () => {
  const { selectedCategory, setSelectedCategory } = useAppContext();
  // const [activeTab, setActiveTab] = React.useState<string>('write'); // Removed activeTab state

  // Define tab data
  const tabsData: TabItem[] = [
    { id: 'write', label: 'Write', icon: Pencil },
    { id: 'learn', label: 'Learn', icon: GraduationCap },
    { id: 'code', label: 'Code', icon: Code },
    { id: 'life', label: 'Life stuff', icon: Briefcase },
    { id: 'claude', label: 'Claude\'s choice', icon: Lightbulb },
  ];

  // Example handler for onTabClick - adapt as needed
  const handleTabClick = (tabId: string) => {
    console.log("Tab clicked:", tabId);
    // If you were using selectedCategory with tabs, you might do something like:
    // setSelectedCategory(tabId);
  };

  return (
    // This container now doesn't need to handle vertical centering as MainContent handles that
    <div className="w-full max-w-4xl mx-auto">
      {/* Section 1: Centered Hero/Search */}
      <div className="w-full flex flex-col items-center justify-center text-center p-4 sm:p-6">
        <div className="w-full max-w-3xl space-y-6">
          
          {/* Gen.C Logo Image - Moved above H1 and added rounded corners */}
          <div className="mb-4"> {/* Adjusted margin to mb-4, can be fine-tuned */}
            <Image 
              src="/gen-c-logo.png" 
              alt="Gen.C Logo - The Content Generation System" 
              width={360} // Increased from 300
              height={240} // Increased from 200
              className="mx-auto rounded-lg" // Added rounded-lg
              priority 
            />
          </div>

          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
            What will you <span className="text-primary">Script Today</span>?
          </h1>

          <div className="w-full max-w-[638px] mx-auto">
            <SearchInput />
          </div>
          {/* Add TabBar component here */}
          <div className="w-full -mt-2"> {/* Changed pt-4 to -mt-2 to adjust spacing to 16px */}
            <TabBar
              tabs={tabsData}
              // activeTabId prop removed
              onTabClick={handleTabClick} // Using example handler
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const SplitView = () => {
  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col lg:flex-row">
      {/* Left Side: AI Chat & Script Generation */}
      <div className="w-full lg:w-2/5 p-1 sm:p-2 md:p-4 border-r overflow-y-auto flex flex-col bg-muted/30">
        {/* VideoChat now handles its own internal states (processing, error, no video, ready) */}
        <VideoChat /> 
      </div>

      {/* Right Side: Video Player & Information */}
      <div className="w-full lg:w-3/5 p-1 sm:p-2 md:p-4 flex flex-col bg-background">
        <VideoPlayer />
        {/* Redundant selectedVideo details removed as they are now in VideoPlayer component */}
      </div>
    </div>
  );
};

const MainPageInternalContent = () => {
  const { currentView } = useAppContext();

  return (
    <main className="w-full">
      {currentView === 'split' && <BackButton />} {/* Conditional rendering of BackButton */}
      {currentView === 'discovery' ? <DiscoveryView /> : <SplitView />}
    </main>
  );
};

// This will be the main export for app/page.tsx
// It no longer needs to provide AppProvider, AiWriterProvider, AppSidebar, or MainContent
// as these are handled by the root layout (src/app/layout.tsx).
export default function Home() {
  return <MainPageInternalContent />;
} 