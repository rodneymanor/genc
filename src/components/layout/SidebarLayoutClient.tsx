'use client';

import React from 'react';
import PerplexitySidebar from '@/components/layout/PerplexitySidebar';
import { ProSidebarProvider } from 'react-pro-sidebar';
import { cn } from "@/lib/utils";

interface SidebarLayoutClientProps {
  children: React.ReactNode;
}

export default function SidebarLayoutClient({ children }: SidebarLayoutClientProps) {
  return (
    <ProSidebarProvider>
      <div className="flex h-screen">
        <PerplexitySidebar />
        
        <main className="bg-[hsl(var(--background))] rounded-xl overflow-y-auto p-4 md:p-6 m-2 flex-1 h-[calc(100vh-1rem)]">
            {children}
        </main>
      </div>
    </ProSidebarProvider>
  );
} 