"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AnalyzeScriptRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the discover page with analyze tab active
    // router.replace('/inspiration?tab=analyze'); // Commented out as analyze tab is removed from inspiration page
    console.log("Analyze Script page was accessed, redirect is currently disabled."); // Placeholder log
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/10 py-8 px-4 md:px-6 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-foreground mb-4">Analyze Script</h1>
        <p className="text-muted-foreground">
          {/* The Analyze functionality has been integrated with Discover. Redirecting you now... */}
          This page is currently under review. The redirect to the analyze functionality has been temporarily disabled.
        </p>
      </div>
    </div>
  );
} 