'use client';

import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

// Import the component versions
import ProfileSettings from './ProfileSettings';
import TopicsPage from '@/app/(app)/settings/topics/page';

const sidebarNavItems = [
  {
    title: "Profile",
    href: "profile",
  },
  {
    title: "Topics", 
    href: "topics",
  },
  {
    title: "Account",
    href: "account",
  },
];

interface SettingsOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: string;
}

export default function SettingsOverlay({ isOpen, onClose, initialTab = "profile" }: SettingsOverlayProps) {
  const [activeTab, setActiveTab] = useState(initialTab);

  // Update active tab when initialTab changes
  React.useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  const renderContent = () => {
    switch (activeTab) {
      case 'topics':
        return <TopicsPage />;
      case 'account':
        return (
          <div className="space-y-6 max-w-2xl">
            <div>
              <h3 className="text-lg font-medium">Account Settings</h3>
              <p className="text-sm text-muted-foreground">
                Account management features coming soon.
              </p>
            </div>
          </div>
        );
      case 'profile':
      default:
        return <ProfileSettings />;
    }
  };

  const handleNavItemClick = (href: string) => {
    setActiveTab(href);
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent 
        side="right" 
        className="w-full sm:w-[800px] sm:max-w-[90vw] p-0 overflow-hidden"
      >
        <SheetHeader className="px-6 py-4 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
              </Button>
              <SheetTitle className="text-2xl font-bold tracking-tight">Settings</SheetTitle>
            </div>
          </div>
          <p className="text-muted-foreground text-left">
            Manage your account settings and preferences.
          </p>
        </SheetHeader>

        <div className="flex h-[calc(100vh-120px)]">
          {/* Sidebar Navigation */}
          <aside className="w-48 border-r bg-muted/30 p-4">
            <nav className="space-y-1">
              {sidebarNavItems.map((item) => (
                <button
                  key={item.href}
                  onClick={() => handleNavItemClick(item.href)}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                    activeTab === item.href
                      ? 'bg-background shadow-sm text-foreground'
                      : 'text-muted-foreground hover:bg-background/50 hover:text-foreground'
                  }`}
                >
                  {item.title}
                </button>
              ))}
            </nav>
          </aside>

          {/* Content Area */}
          <div className="flex-1 overflow-auto">
            <div className="p-6">
              {renderContent()}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
} 