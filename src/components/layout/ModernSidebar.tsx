'use client';

import React, { useState, useContext, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { AuthContext } from '@/contexts/AuthContext';
import { capitalizeUserName } from '@/lib/utils';
import { getUserScripts } from '@/lib/firestoreService';
import { Timestamp } from 'firebase/firestore';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  Home,
  Search,
  Waypoints,
  FileText,
  FilePen,
  Plus,
  ChevronDown,
  ChevronsLeft,
  Award,
  ThumbsUp,
  CircleHelp,
  LogOut,
  User,
  Settings,
  Library,
  Compass,
  MicVocal,
} from 'lucide-react';

// Main navigation items - user's specific requirements
const mainNavItems = [
  {
    label: 'Home',
    href: '/',
    icon: Home,
    isActive: (pathname: string) => pathname === '/'
  },
  {
    label: 'Library',
    href: '/my-scripts',
    icon: Library,
    isActive: (pathname: string) => pathname === '/my-scripts' || pathname.startsWith('/my-scripts')
  },
  {
    label: 'Inspiration',
    href: '/inspiration',
    icon: Compass,
    isActive: (pathname: string) => pathname === '/inspiration' || pathname.startsWith('/inspiration')
  },
  {
    label: 'Voice',
    href: '/voice',
    icon: MicVocal,
    isActive: (pathname: string) => pathname === '/voice' || pathname.startsWith('/voice')
  }
];

// Bottom navigation items
const bottomNavItems = [
  {
    label: 'Invite and earn',
    icon: Award,
    onClick: () => console.log('Invite clicked')
  },
  {
    label: 'Feedback',
    icon: ThumbsUp,
    onClick: () => console.log('Feedback clicked')
  },
  {
    label: 'Support',
    icon: CircleHelp,
    onClick: () => console.log('Support clicked')
  }
];

interface UsageMetric {
  label: string;
  current: number;
  max: number;
  helpTooltip?: string;
}

// Usage metrics
const usageMetrics: UsageMetric[] = [
  {
    label: 'Words/day',
    current: 0,
    max: 1000,
    helpTooltip: 'AI-generated words per day'
  },
  {
    label: 'Scripts/day',
    current: 0,
    max: 5,
    helpTooltip: 'Number of scripts created per day'
  },
  {
    label: 'Analysis/day',
    current: 0,
    max: 1,
    helpTooltip: 'Content analysis reports per day'
  }
];

const ModernSidebar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { userProfile, logout } = useContext(AuthContext) || {};
  const [recentScripts, setRecentScripts] = useState<any[]>([]);
  const [isLoadingScripts, setIsLoadingScripts] = useState(true);

  // Ensure pathname is never null for our functions
  const currentPath = pathname || '/';

  // Fetch user's recent scripts
  useEffect(() => {
    const fetchRecentScripts = async () => {
      if (!userProfile?.uid) {
        setRecentScripts([]);
        setIsLoadingScripts(false);
        return;
      }

      try {
        setIsLoadingScripts(true);
        const scripts = await getUserScripts(userProfile.uid, 3); // Get latest 3 scripts
        setRecentScripts(scripts);
      } catch (error) {
        console.error('Error fetching recent scripts:', error);
        setRecentScripts([]);
      } finally {
        setIsLoadingScripts(false);
      }
    };

    fetchRecentScripts();
  }, [userProfile?.uid]);

  const handleLogout = async () => {
    if (logout) {
      await logout();
      router.push('/auth/login');
    }
  };

  const getUserDisplayName = (): string => {
    if (userProfile?.displayName) {
      return capitalizeUserName(userProfile.displayName);
    }
    if (userProfile?.email) {
      return capitalizeUserName(userProfile.email.split('@')[0]);
    }
    return 'User';
  };

  return (
    <div className="flex flex-col h-full w-64 bg-sidebar border-r border-sidebar-border text-sidebar-foreground">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
        {/* Left side: User dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm"
              className="flex items-center gap-2 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            >
              <span className="truncate font-semibold text-sm">{getUserDisplayName()}</span>
              <ChevronDown className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-56 rounded-lg"
            side="bottom"
            align="start"
            sideOffset={4}
          >
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{getUserDisplayName()}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {userProfile?.email || 'user@example.com'}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/settings" className="w-full cursor-pointer">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
              <LogOut className="mr-2 h-4 w-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Right side: Plus button */}
        <Button variant="ghost" size="sm" asChild className="hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
          <Link href="/">
            <Plus className="h-4 w-4" />
          </Link>
        </Button>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Main Navigation */}
        <div>
          <h3 className="text-xs font-medium text-sidebar-foreground/60 uppercase tracking-wider mb-3">
            Navigation
          </h3>
          <nav className="space-y-1">
            {mainNavItems.map((item) => {
              const isActive = item.isActive(currentPath);
              return (
                <Link key={item.label} href={item.href}>
                  <div className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    isActive 
                      ? "bg-sidebar-accent text-sidebar-accent-foreground" 
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  )}>
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </div>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Recent Scripts */}
        <div>
          <h3 className="text-xs font-medium text-sidebar-foreground/60 uppercase tracking-wider mb-3">
            Recent Scripts
          </h3>
          <div className="space-y-1">
            {isLoadingScripts ? (
              <div className="flex items-center gap-3 px-3 py-2 text-sm text-sidebar-foreground/60">
                <FileText className="h-4 w-4" />
                <span>Loading scripts...</span>
              </div>
            ) : recentScripts.length > 0 ? (
              recentScripts.map((script) => (
                <Link key={script.id} href={`/ai-writer/${script.id}`}>
                  <div className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors">
                    <FileText className="h-4 w-4" />
                    <span className="truncate">{script.title || 'Untitled Script'}</span>
                  </div>
                </Link>
              ))
            ) : (
              <div className="flex items-center gap-3 px-3 py-2 text-sm text-sidebar-foreground/60">
                <FilePen className="h-4 w-4" />
                <span>No recent scripts</span>
              </div>
            )}
          </div>
        </div>

        {/* Usage Panel */}
        <div className="rounded-lg border border-sidebar-border bg-sidebar p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-medium text-sidebar-foreground/60 uppercase tracking-wider">
              Plan Usage
            </h3>
            <Badge variant="secondary" className="bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
              {userProfile?.subscriptionStatus || 'Free'}
            </Badge>
          </div>
          
          <div className="space-y-3">
            {usageMetrics.map((metric) => (
              <div key={metric.label} className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-sidebar-foreground/80">{metric.label}</span>
                  <span className="text-sidebar-foreground/60">
                    {metric.current}/{metric.max}
                  </span>
                </div>
                <Progress 
                  value={(metric.current / metric.max) * 100} 
                  className="h-1.5"
                />
              </div>
            ))}
          </div>
          
          <Button className="w-full text-sm font-medium">
            Get unlimited
          </Button>
        </div>
      </div>

      {/* Footer - Bottom Navigation */}
      <div className="p-4 border-t border-sidebar-border space-y-1">
        {bottomNavItems.map((item) => (
          <Button
            key={item.label}
            variant="ghost"
            size="sm"
            onClick={item.onClick}
            className="w-full justify-start gap-3 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default ModernSidebar; 