'use client';

import React from 'react';
import Link from 'next/link';

const AppHeader = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <span className="font-poppins font-bold text-2xl">
            C
          </span>
        </Link>
        {/* <nav className="flex items-center space-x-6 text-sm font-medium">
          <Link href="/explore" className="text-muted-foreground transition-colors hover:text-foreground">Explore</Link>
          <Link href="/favorites" className="text-muted-foreground transition-colors hover:text-foreground">Favorites</Link>
        </nav> */}
        {/* Add Theme Toggle or User Profile button here later */}
      </div>
    </header>
  );
};

export default AppHeader; 