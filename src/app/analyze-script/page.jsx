"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AnalyzeScriptRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the discover page with analyze tab active
    router.replace('/discover?tab=analyze');
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/10 py-8 px-4 md:px-6 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-foreground mb-4">Redirecting...</h1>
        <p className="text-muted-foreground">
          The Analyze functionality has been integrated with Discover. Redirecting you now...
        </p>
      </div>
    </div>
  );
} 