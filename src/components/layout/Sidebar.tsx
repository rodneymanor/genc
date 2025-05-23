"use client";

import Link from "next/link";
import Image from "next/image"; // Assuming you might have an image logo
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { Home, Compass, Box, Download, Settings, LogOut, UserCircle2, HelpCircle } from "lucide-react"; // Using Box for "Spaces"
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";

// Placeholder for a logo component or direct text/image
const Logo = () => (
  <Link href="/" className="flex items-center gap-2 px-4 py-3 mb-4">
    {/* Replace with your actual logo - Image component or text */}
    {/* <Image src="/logo.svg" alt="Logo" width={32} height={32} /> */}
    <span className="text-2xl font-bold text-primary">YourApp</span>
  </Link>
);

const navLinks = [
  { href: "/", label: "Home", icon: Home },
  { href: "/discover", label: "Discover", icon: Compass },
  { href: "/spaces", label: "Spaces", icon: Box }, // Added "Spaces"
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex flex-col w-64 border-r bg-secondary/50 dark:bg-card h-screen fixed left-0 top-0 z-40">
      <Logo />
      <nav className="flex-grow px-2 space-y-1">
        <TooltipProvider delayDuration={0}>
          {navLinks.map((link) => (
            <Tooltip key={link.label}>
              <TooltipTrigger asChild>
                <Link href={link.href} legacyBehavior passHref>
                  <Button
                    variant={pathname === link.href ? "secondary" : "ghost"}
                    className="w-full justify-start text-base"
                    aria-current={pathname === link.href ? "page" : undefined}
                  >
                    <link.icon className="h-5 w-5 mr-3" />
                    {link.label}
                  </Button>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right" className="md:hidden"> {/* Show tooltip only if text is hidden (e.g. collapsed state, not used here) */}
                <p>{link.label}</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </TooltipProvider>
      </nav>

      <div className="mt-auto p-2 space-y-2 border-t">
        {/* Download Button - Simplified, adjust as needed */}
        <TooltipProvider delayDuration={0}>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button variant="ghost" className="w-full justify-start text-base">
                        <Download className="h-5 w-5 mr-3" />
                        Download App
                    </Button>
                </TooltipTrigger>
                 <TooltipContent side="right">
                    <p>Download App</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>

        {/* User Profile */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="w-full justify-start h-auto py-2 text-base">
              <Avatar className="h-8 w-8 mr-3">
                <AvatarImage src="https://github.com/shadcn.png" alt="@username" /> {/* Replace with actual user image */}
                <AvatarFallback>UR</AvatarFallback> {/* Replace with user initials */}
              </Avatar>
              <div className="flex flex-col items-start">
                <span>Username</span> {/* Replace with actual username */}
                <span className="text-xs text-muted-foreground">PRO</span>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 mb-2 ml-2" align="end" forceMount>
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <UserCircle2 className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
                <HelpCircle className="mr-2 h-4 w-4" />
                <span>Support</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  );
} 