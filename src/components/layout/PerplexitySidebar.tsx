'use client';

import '@/styles/perplexity-sidebar.css'; // Import the new CSS file
import React, { useState, useEffect, useContext } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Sidebar, Menu, MenuItem, SubMenu, useProSidebar } from 'react-pro-sidebar';
import { usePathname, useRouter } from 'next/navigation'; // Import usePathname and useRouter
import { AuthContext } from '@/contexts/AuthContext'; // Import AuthContext
import {
  Home as IconHome,
  Search,
  LayoutGrid,
  Settings2 as IconSettings,
  Sparkles,
  FilePenLine,
  Plus,
  Download as IconDownload,
  UserCircle2,
  ChevronDown as IconChevronDown,
  Menu as IconMenu2,
  LayoutDashboard, // Added
  FilePlus2,     // Added
  ListOrdered,   // Added
  BarChart3,     // Added
  Compass,       // Added
  MicVocal,      // Added
  BookOpen,      // Added for My Scripts
  Library,       // Alternative for My Scripts, or use BookOpen
  LogOut,        // Added for logout
  User,          // Added for profile
  // Settings icon is already IconSettings
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// New mainNavItems structure
export const mainNavItems = [
  // {
  //   label: "Dashboard",
  //   path: "/",
  //   iconName: "LayoutDashboard",
  // },
  // {
  //   label: "Create Script",
  //   path: "/create-script/idea",
  //   iconName: "FilePlus2",
  // },
  {
    label: "My Scripts",
    path: "/my-scripts",
    iconName: "BookOpen",
  },
  {
    label: "Discover & Analyze",
    path: "/discover",
    iconName: "Compass",
    // Example of sub-items if needed later, matching react-pro-sidebar structure
    // subItems: [
    //   { label: "Discover Content", path: "/discover?tab=discover" },
    //   { label: "Analyze Content", path: "/discover?tab=analyze" },
    // ]
  },
  {
    label: "Tone Studio",
    path: "/tone-studio",
    iconName: "MicVocal",
  },
  {
    label: "Settings",
    path: "/settings",
    iconName: "IconSettings", // Using the aliased IconSettings
  },
];

// Map icon names to actual components
const iconMap: Record<string, React.ElementType> = {
  LayoutDashboard,
  FilePlus2,
  ListOrdered,
  BarChart3,
  Compass,
  MicVocal,
  IconSettings, // Mapped the aliased name
  // Add other icons from original scriboData if they are still needed elsewhere or for submenus
  FilePenLine,
  Search,
  LayoutGrid,
  Sparkles,
  BookOpen,      // Added for My Scripts
  Library,       // Alternative for My Scripts, or use BookOpen
};

// Re-define scriboData or import if it's moved to a shared location
// For now, defining it here for self-containment of this example
const scriboData = {
  user: {
    name: "Scribo User",
    email: "user@scribo.ai",
    avatar: "/avatars/default-user.png", // Ensure this path is correct
  },
  // navMain is now replaced by mainNavItems
};

// Updated SidebarHeader: Removed toggle functionality and button for desktop
const SidebarHeader = ({ collapsed }: { collapsed: boolean }) => {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '10px 0px', borderBottom: '1px solid hsl(var(--border) / 0.5)', height: '65px' /* Fixed height */ }}>
      <Link href="/" passHref style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', color: 'inherit' }}>
        <Image src="/scribo-logo.png" alt="Scribo Logo" width={40} height={40} />
        {/* Name removed as it will always be collapsed on desktop */}
      </Link>
      {/* Hamburger/toggle button is removed for always-collapsed desktop */}
    </div>
  );
};

const NavigationMenu = () => {
  const { collapsed } = useProSidebar();
  const pathname = usePathname();

  return (
    <Menu
      menuItemStyles={{
        button: ({ level, active, disabled }) => {
          // only apply styles on first level elements of the tree
          if (level === 0) {
            return {
              color: active ? 'hsl(var(--primary-foreground))' : 'hsl(var(--muted-foreground))',
              backgroundColor: active ? 'hsl(var(--primary))' : undefined,
              borderRadius: '0.375rem', // Equivalent to rounded-md, ensure consistency
              margin: '0.25rem 0.5rem', // Add some margin to see the rounded effect clearly
              transition: 'background-color 0.2s ease-in-out, color 0.2s ease-in-out', // Smooth transition
              '&:hover': {
                backgroundColor: active 
                  ? 'hsl(var(--primary) / 0.9)' // Darken active item slightly on hover
                  : 'hsl(var(--primary) / 0.15)', // Transparent version of primary for non-active hover
                color: active 
                  ? 'hsl(var(--primary-foreground))' 
                  : 'hsl(var(--foreground))', // Ensure good contrast on hover
              },
            };
          }
        },
        icon: ({ active }) => ({
          // color: active ? 'hsl(var(--primary-foreground))' : 'hsl(var(--primary))'
          // Let the button style handle icon color for better consistency with text
        }),
        // ... other styles ...
      }}
    >
        <Tooltip>
          <TooltipTrigger asChild>
            <MenuItem
              icon={<Plus size={20} />}
              component={<Link href="/" />}
              className="new-thread-button"
              onClick={(e) => {
                if (pathname === '/') {
                  e.preventDefault(); // Prevent Link's default action if already on root
                  window.location.reload();
                }
                // If not on '/', Link component handles navigation normally
              }}
            >
             {/* The icon color is inherited from the button text color if not set directly on icon style fn */}
             {/* Let's ensure the icon color is primary-foreground for this button */}
            </MenuItem>
          </TooltipTrigger>
          <TooltipContent side="right" sideOffset={15}>
            <p>New Script</p>
          </TooltipContent>
        </Tooltip>

        {mainNavItems.map((item, index) => {
          const IconComponent = iconMap[item.iconName as keyof typeof iconMap];
          const isActive = pathname ? (pathname === item.path || (item.path !== "/" && pathname.startsWith(item.path) && item.path.length > 1)) : false;

          return (
            <Tooltip key={item.label}>
              <TooltipTrigger asChild>
                 <MenuItem
                    icon={IconComponent ? <IconComponent size={20} /> : undefined}
                    active={isActive}
                    component={<Link href={item.path} />}
                  >
                    {/* Label is not shown when collapsed */}
                  </MenuItem>
              </TooltipTrigger>
              <TooltipContent side="right" sideOffset={15}>
                <p>{item.label}</p>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </Menu>
  );
};

const ProfileSection = () => {
  const authContext = useContext(AuthContext);
  const router = useRouter();
  
  const handleProfileClick = () => {
    if (!authContext?.userProfile) {
      // User is not logged in, redirect to login page
      router.push('/login');
    } else {
      // User is logged in, navigate to profile page
      router.push('/profile');
    }
  };

  const handleLogout = async () => {
    try {
      await authContext?.logout();
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (!authContext?.userProfile) {
    // User not logged in - show simple login button
    return (
      <div style={{ padding: '10px 0px', borderTop: '1px solid hsl(var(--border) / 0.5)', marginTop: 'auto', display: 'flex', justifyContent: 'center' }}>
        <Menu>
          <Tooltip>
            <TooltipTrigger asChild>
              <MenuItem
                icon={<UserCircle2 size={24} />}
                onClick={handleProfileClick}
                title="Login"
              >
                {/* Name and dropdown arrow removed for collapsed view */}
              </MenuItem>
            </TooltipTrigger>
            <TooltipContent side="right" sideOffset={15}>
              <p>Login</p>
            </TooltipContent>
          </Tooltip>
        </Menu>
      </div>
    );
  }

  // User is logged in - show dropdown menu
  const displayName = authContext.userProfile.displayName || authContext.userProfile.email || 'User';
  const initials = displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div style={{ padding: '10px 0px', borderTop: '1px solid hsl(var(--border) / 0.5)', marginTop: 'auto', display: 'flex', justifyContent: 'center' }}>
      <DropdownMenu>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <div 
                className="w-11 h-11 rounded-full bg-primary text-primary-foreground flex items-center justify-center cursor-pointer hover:bg-primary/90 transition-colors"
                style={{ margin: '0.25rem 0.5rem' }}
              >
                <span className="text-sm font-medium">{initials}</span>
              </div>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent side="right" sideOffset={15}>
            <p>{displayName}</p>
          </TooltipContent>
        </Tooltip>
        
        <DropdownMenuContent side="right" align="end" className="w-56">
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{displayName}</p>
              <p className="text-xs leading-none text-muted-foreground">
                {authContext.userProfile.email}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleProfileClick}>
            <User className="mr-2 h-4 w-4" />
            <span>Profile</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => router.push('/settings')}>
            <IconSettings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Log out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default function PerplexitySidebar() {
  // collapseSidebar from useProSidebar can be used if we allow programmatic toggle elsewhere
  // but for always collapsed, we set it directly on <Sidebar>
  const { broken } = useProSidebar(); // `broken` is for responsive toggling, might still be useful for mobile

  // The sidebar will be controlled by the `collapsed` prop on Sidebar component directly
  // No need for local state or useEffect to force collapse if we pass it directly.

  return (
    <TooltipProvider delayDuration={0}>
      <Sidebar 
        collapsed={true}
        collapsedWidth="72px"
        toggled={broken}
        breakPoint="md"
        backgroundColor="hsl(var(--sidebar-background) / 0.4)"
        className="perplexity-sidebar backdrop-blur-lg"
        style={{ minHeight: "100dvh", height: "auto", display: "flex", flexDirection: "column", borderColor: "hsl(var(--sidebar-border) / 0.5)" }}
      >
        <SidebarHeader collapsed={true} />
        <div style={{ flexGrow: 1, overflowY: 'visible', overflowX: 'visible' }}>
          <NavigationMenu />
        </div>
        <ProfileSection />
      </Sidebar>
    </TooltipProvider>
  );
} 