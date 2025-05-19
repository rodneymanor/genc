'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Plus,
  Home,
  Compass,
  Sparkles, // Changed from Wand2 to Sparkles based on prior discussion
  Download,
  User,
  Pin,
  Settings2,
  TrendingUp,
  MoreHorizontal,
  ChevronRight,
  ChevronDown,
  X, // For a potential close button on the wide sidebar if needed
} from 'lucide-react';
import { cn } from '@/lib/utils'; // Assuming you have a cn utility

const AppSidebar = () => {
  const [isPinned, setIsPinned] = useState(false);
  const [isWideSidebarVisible, setIsWideSidebarVisible] = useState(false);
  const [activeWideSidebarContent, setActiveWideSidebarContent] = useState('Home'); // To manage content in wide sidebar
  const [mounted, setMounted] = useState(false);

  const sidebarAssemblyRef = useRef<HTMLDivElement>(null);

  // Fix hydration issues by waiting for client-side render
  useEffect(() => {
    setMounted(true);
  }, []);

  const togglePin = (event: React.MouseEvent) => {
    event.stopPropagation();
    setIsPinned(!isPinned);
  };

  // Placeholder for New button action
  const handleNewAction = () => {
    console.log('"New" button clicked. Intended action: Open new item creation dialog or navigate.');
  };

  // Placeholder for Download App action
  const handleDownloadApp = () => {
    console.log('"Download App" button clicked. Intended action: Trigger app download or navigate to download page.');
  };

  // Placeholder for User Profile action
  const handleUserProfile = () => {
    console.log('"User Profile" button clicked. Intended action: Open user profile menu or navigate to profile page.');
  };
  
  useEffect(() => {
    const handleMouseEnter = () => {
      if (!isPinned) {
        setIsWideSidebarVisible(true);
      }
    };

    const handleMouseLeave = () => {
      if (!isPinned) {
        setIsWideSidebarVisible(false);
      }
    };

    const currentSidebarAssemblyRef = sidebarAssemblyRef.current;

    if (currentSidebarAssemblyRef) {
      currentSidebarAssemblyRef.addEventListener('mouseenter', handleMouseEnter);
      currentSidebarAssemblyRef.addEventListener('mouseleave', handleMouseLeave);
    }

    return () => {
      if (currentSidebarAssemblyRef) {
        currentSidebarAssemblyRef.removeEventListener('mouseenter', handleMouseEnter);
        currentSidebarAssemblyRef.removeEventListener('mouseleave', handleMouseLeave);
      }
    };
  }, [isPinned]);

  useEffect(() => {
    if (isPinned) {
      setIsWideSidebarVisible(true);
    }
    // If unpinned, visibility is handled by mouse enter/leave
  }, [isPinned]);


  const navItems = [
    { name: 'Home', href: '/', icon: Home, exactMatch: true },
    { name: 'Discover', href: '/discover', icon: Compass },
    { name: 'AI Writer', href: '/ai-writer', icon: Sparkles },
  ];

  // Use a more reliable way to get current path that works consistently on server and client
  const currentPath = mounted ? (typeof window !== 'undefined' ? window.location.pathname : '/') : '/';

  const sampleLibraryItems = [
    { id: '1', title: 'My First Script Analysis', href: '#script-1' },
    { id: '2', title: 'Video on Quantum Physics Explained', href: '#video-2' },
    { id: '3', title: 'Marketing Campaign Ideas - Draft 1', href: '#campaign-3' },
  ];
  const [selectedLibraryItem, setSelectedLibraryItem] = useState<string | null>(sampleLibraryItems[1]?.id || null);


  return (
    <>
      <style jsx global>{`
        /* Custom scrollbar for WebKit browsers */
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1; /* Tailwind gray-400 */
          border-radius: 3px;
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #475569; /* Tailwind slate-600 */
        }
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: #cbd5e1 transparent; /* thumb and track */
        }
        .dark .custom-scrollbar {
          scrollbar-color: #475569 transparent;
        }
      `}</style>
      <div 
        ref={sidebarAssemblyRef}
        className={cn(
          "sidebar-assembly group/sidebar relative h-screen flex z-50",
        )}
      >
        {/* Narrow Sidebar */}
        <div
          id="narrow-sidebar"
          className="w-[72px] bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col items-center py-4 z-30 shrink-0"
        >
          <Link href="/" className="mb-5 block" onClick={() => setActiveWideSidebarContent('Home')}>
            <span className="font-poppins font-bold text-3xl text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-500 transition-colors duration-200">
              C
            </span>
          </Link>

          <button 
            onClick={handleNewAction}
            className="my-3 p-2.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-blue-500 hover:text-white dark:hover:bg-blue-600 transition-all duration-200 active:scale-95"
            title="New"
          >
            <Plus size={20} strokeWidth={2.5} />
          </button>

          <nav className="flex flex-col items-center space-y-1 mt-2">
            {navItems.map((item) => {
              const isSelected = item.exactMatch ? currentPath === item.href : currentPath.startsWith(item.href);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setActiveWideSidebarContent(item.name)}
                  className={cn(
                    "group/navitem flex flex-col items-center p-2 w-full rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800",
                    isSelected && "bg-slate-100 dark:bg-slate-800"
                  )}
                  aria-selected={isSelected}
                >
                  {mounted ? (
                    <item.icon
                      size={22}
                      className={cn(
                        "group-hover/navitem:text-blue-600 dark:group-hover/navitem:text-blue-500",
                        isSelected ? "text-slate-700 dark:text-slate-200" : "text-slate-500 dark:text-slate-400"
                      )}
                    />
                  ) : (
                    <div className="w-[22px] h-[22px]" />
                  )}
                  <span
                    className={cn(
                      "text-xs mt-1 group-hover/navitem:text-blue-600 dark:group-hover/navitem:text-blue-500",
                      isSelected ? "text-slate-700 dark:text-slate-200" : "text-slate-500 dark:text-slate-400"
                    )}
                  >
                    {item.name}
                  </span>
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto flex flex-col items-center space-y-3">
            <button
              onClick={handleDownloadApp}
              title="Download App"
              className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400"
            >
              <Download size={20} />
            </button>
            <div className="relative group/user">
              <button
                onClick={handleUserProfile}
                title="User Profile"
                className="h-8 w-8 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400 flex items-center justify-center ring-1 ring-slate-300 dark:ring-slate-600 hover:ring-blue-500 transition-all"
              >
                <User size={16} />
              </button>
              <div className="absolute -top-1 -right-3">
                <span className="inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white bg-gradient-to-r from-purple-500 to-pink-500 rounded-full shadow-md">
                  PRO
                </span>
              </div>
              <ChevronDown
                size={12}
                strokeWidth={2.5}
                className={cn(
                  "text-slate-400 dark:text-slate-500 absolute right-0 top-1/2 -translate-y-1/2 translate-x-[calc(100%+4px)] transition-opacity duration-150",
                  (isWideSidebarVisible || isPinned) ? "opacity-100" : "opacity-0" 
                )}
              />
            </div>
          </div>
        </div>

        {/* Wide Sidebar */}
        <div
          id="wide-sidebar"
          className={cn(
            "fixed top-0 h-full w-[250px] bg-white dark:bg-slate-900",
            "border-r border-slate-200 dark:border-slate-800 shadow-2xl",
            "transition-all duration-200 ease-in-out z-20",
            "flex flex-col",
            (isWideSidebarVisible || isPinned) ? "translate-x-[72px] opacity-100 pointer-events-auto" : "-translate-x-full opacity-0 pointer-events-none"
          )}
          style={{ left: '0px' }} 
        >
          <div className="relative flex min-h-[57px] items-center justify-between p-3 border-b border-slate-200 dark:border-slate-700 shrink-0">
            <div className="font-medium text-slate-800 dark:text-slate-100">{activeWideSidebarContent}</div>
            <div className="flex items-center space-x-1">
              <button
                title="Customize Sidebar"
                className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
              >
                <Settings2 size={16} />
              </button>
              <button
                id="pin-sidebar-button"
                title={isPinned ? "Unpin Sidebar" : "Pin Sidebar"}
                onClick={togglePin}
                className={cn(
                  "p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors",
                  isPinned && "bg-blue-100 dark:bg-blue-700 text-blue-600 dark:text-blue-300"
                )}
              >
                <Pin size={16} className={cn("transition-transform duration-200", isPinned && "rotate-45")} />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-3.5 custom-scrollbar">
            {/* Content for "Home" wide sidebar */}
            {activeWideSidebarContent === 'Home' && (
              <div className="space-y-1">
                 <a href="#" className="group/item flex items-center gap-2.5 p-1.5 -mx-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors">
                    <TrendingUp size={18} className="shrink-0 text-slate-500 dark:text-slate-400" />
                    <span className="flex-grow truncate font-medium">Finance Dashboard</span>
                    <button className="opacity-0 group-hover/item:opacity-100 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 p-0.5 rounded">
                        <MoreHorizontal size={14} strokeWidth={3} />
                    </button>
                </a>
                {/* Add more Home specific items here */}
              </div>
            )}
            
            {/* Placeholder for Discover content */}
            {activeWideSidebarContent === 'Discover' && (
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Discover content placeholder. Filters and cards for discoverable items would go here.</p>
              </div>
            )}

            {/* Placeholder for AI Writer content */}
            {activeWideSidebarContent === 'AI Writer' && (
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">AI Writer content placeholder. A freeform text input area for script generation would go here.</p>
              </div>
            )}


            <div className="h-px bg-slate-200 dark:bg-slate-700 my-3"></div>

            <div>
              <div className="group/header flex items-center justify-between mb-1 h-6">
                <a
                  href="#"
                  className="text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 flex items-center gap-1"
                >
                  Library
                  <ChevronRight size={14} strokeWidth={2.5} className="opacity-0 group-hover/header:opacity-100 transition-opacity" />
                </a>
              </div>
              <div className="space-y-0.5">
                {sampleLibraryItems.map((item) => (
                  <a
                    key={item.id}
                    href={item.href} // In a real app, this might be a NextLink or trigger an action
                    onClick={() => setSelectedLibraryItem(item.id)} // Example selection
                    className={cn(
                        "group/item flex items-center gap-2 p-1.5 -mx-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors",
                        selectedLibraryItem === item.id && "bg-slate-100 dark:bg-slate-800"
                    )}
                    aria-selected={selectedLibraryItem === item.id}
                  >
                    <span className="flex-grow truncate text-sm">{item.title}</span>
                    <button className="opacity-0 group-hover/item:opacity-100 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 p-0.5 rounded">
                      <MoreHorizontal size={14} strokeWidth={3}/>
                    </button>
                  </a>
                ))}
              </div>
              <a href="#" className="block text-xs text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 mt-2 pl-1.5">
                View All
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AppSidebar; 