"use client";

import { OrbitingCircles } from "@/components/magicui/orbiting-circles";
// Badge removed as it won't fit well in a 36x36px version
// import { Badge } from "@/components/ui/badge"; 
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

// Icons for the demo
const Icons = {
  instagram: () => (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919C8.416 2.175 8.796 2.163 12 2.163m0-2.163C8.74 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.74 0 12s.014 3.667.072 4.947c.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.74 24 12 24s3.667-.014 4.947-.072c4.358-.2 6.78-2.618 6.98-6.98.058-1.28.072-1.687.072-4.947s-.014-3.667-.072-4.947c-.2-4.356-2.62-6.78-6.98-6.98C15.667.014 15.26 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.88 1.44 1.44 0 000-2.88z"/>
    </svg>
  ),
  tiktok: () => (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-1.06-.6-1.9-1.44-2.46-2.55-1.31-2.58-1.18-5.96.34-8.29.88-1.39 2.07-2.45 3.52-3.11.04-2.14.01-4.28.01-6.43H12.525v.02z"/>
    </svg>
  ),
  youtube: () => (
    <svg viewBox="0 0 512 361" fill="currentColor">
      <path d="M508.642 142.857c-2.308-22.578-18.396-40.328-40.604-43.038C431.958 97.143 256 97.143 256 97.143s-175.958 0-212.038 2.676C21.716 102.529 5.67 120.279 3.36 142.857 0 168.604 0 224 0 224s0 55.396 3.36 81.143c2.31 22.578 18.398 40.328 40.604 43.038 36.042 2.676 212.038 2.676 212.038 2.676s175.958 0 212.038-2.676c22.208-2.71 38.296-20.46 40.604-43.038C512 279.396 512 224 512 224s0-55.396-3.358-81.143zM204.8 270.4V177.6L332.8 224 204.8 270.4z"/>
    </svg>
  ),
  facebook: () => (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M22.675 0h-21.35C.59 0 0 .59 0 1.325v21.35C0 23.41.59 24 1.325 24H12.82v-9.294H9.692v-3.622h3.128V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116c.735 0 1.325-.59 1.325-1.325V1.325C24 .59 23.407 0 22.675 0z"/>
    </svg>
  )
};

export function OrbitingCirclesDemoSmall() {
  return (
    <div className="relative flex size-10 flex-col items-center justify-center overflow-hidden">
      {/* Center content - simplified for small size - Text removed */}
      <div className="z-10 flex flex-col items-center">
        {/* <span className="text-[8px]">Tiny</span> */}
      </div>
      
      {/* Outer orbit - Scaled down settings */}
      <OrbitingCircles iconSize={8} radius={16} path={true} duration={20} speed={1}>
        <Icons.instagram />
        <Icons.tiktok />
        <Icons.youtube />
        <Icons.facebook />
      </OrbitingCircles>
      
      {/* Inner orbit - Scaled down custom settings */}
      <OrbitingCircles iconSize={6} radius={10} reverse speed={2} path={true} duration={20}>
        <Icons.instagram />
        <Icons.tiktok />
        {/* Removing two icons from inner orbit for clarity at small scale */}
      </OrbitingCircles>
    </div>
  );
}

export default function TestOrbitingPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      {/* Header */} 
      <div className="absolute top-6 left-6 z-20">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => router.push('/')}
          className="hover:bg-muted/50"
        >
          <ArrowLeft size={16} className="mr-1" />
          Back to Main Page
        </Button>
      </div>
      
      <h1 className="text-2xl font-bold mb-4">Small Orbiting Demo (approx 40x40px)</h1>
      {/* Full screen orbiting demo - replaced with small version */}
      <OrbitingCirclesDemoSmall />
      
      {/* You can add the larger demo back if needed, or other content */}
      {/* <div className="mt-8 w-full max-w-2xl">
        <h2 className="text-xl font-bold mb-2">Original Large Demo (for comparison)</h2>
        <OriginalOrbitingCirclesDemo /> // Assuming you rename the original to this
      </div> */}
    </div>
  );
}

// It might be good to keep the original demo function if you want to switch between them
// function OriginalOrbitingCirclesDemo() { ... original code ... }

// It might be good to keep the original demo function if you want to switch between them
// function OriginalOrbitingCirclesDemo() { ... original code ... } 