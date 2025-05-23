"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle, SheetClose } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Menu, Home, Compass, Box, Download, X } from "lucide-react";
import { usePathname } from "next/navigation";

// Re-using navLinks from Sidebar.tsx concept for consistency
const navLinks = [
  { href: "/", label: "Home", icon: Home },
  { href: "/discover", label: "Discover", icon: Compass },
  { href: "/spaces", label: "Spaces", icon: Box },
];

// Placeholder for a logo component or direct text/image for mobile nav
const MobileLogo = () => (
  <Link href="/" className="flex items-center gap-2">
    <span className="text-xl font-bold text-primary">YourApp</span>
  </Link>
);

export function MobileNav() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="md:hidden fixed top-3 left-3 z-50"> {/* Show only on mobile */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" aria-label="Open navigation menu">
            <Menu className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-72 p-0 flex flex-col">
          <SheetHeader className="p-4 border-b">
            <SheetTitle className="flex items-center justify-between">
              <MobileLogo />
              <SheetClose asChild>
                 <Button variant="ghost" size="icon" aria-label="Close navigation menu">
                    <X className="h-5 w-5" />
                 </Button>
              </SheetClose>
            </SheetTitle>
          </SheetHeader>
          
          <nav className="flex-grow p-4 space-y-2 overflow-y-auto">
            {navLinks.map((link) => (
              <SheetClose asChild key={link.label}>
                <Link href={link.href} legacyBehavior passHref>
                  <Button
                    variant={pathname === link.href ? "secondary" : "ghost"}
                    className="w-full justify-start text-base py-3 h-auto"
                    aria-current={pathname === link.href ? "page" : undefined}
                  >
                    <link.icon className="h-5 w-5 mr-3" />
                    {link.label}
                  </Button>
                </Link>
              </SheetClose>
            ))}
          </nav>

          <div className="mt-auto p-4 border-t space-y-2">
            {/* Download Button */}
            <SheetClose asChild>
                <Button variant="ghost" className="w-full justify-start text-base py-3 h-auto">
                    <Download className="h-5 w-5 mr-3" />
                    Download App
                </Button>
            </SheetClose>

            {/* User Profile - Simplified for mobile sheet, could be a link to a profile page or trigger a modal */}
            <SheetClose asChild>
                <Link href="/profile" legacyBehavior passHref> {/* Or open a Dropdown/Modal */}
                    <Button variant="ghost" className="w-full justify-start text-base py-3 h-auto">
                    <Avatar className="h-8 w-8 mr-3">
                        <AvatarImage src="https://github.com/shadcn.png" alt="@username" />
                        <AvatarFallback>UR</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col items-start">
                        <span>Username</span>
                        <span className="text-xs text-muted-foreground">View Profile</span>
                    </div>
                    </Button>
                </Link>
            </SheetClose>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
} 