"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import React from "react";
import { IconFileSearch, IconListDetails, IconFileText } from "@tabler/icons-react";
import AppSidebar from "@/components/layout/AppSidebar";
import MainContent from "@/components/layout/MainContent";
import { AppProvider } from "@/contexts/AppContext";
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import { Suspense } from "react";
import { ClientTweetCard } from "@/components/magicui/client-tweet-card";
import { TweetSkeleton } from "@/components/magicui/tweet-card";

// Placeholder for the title component/styling
const PageTitle = ({ title }: { title: string }) => {
  return (
    <div className="max-w-3xl mx-auto pt-8 pb-4 md:pt-12 md:pb-6">
      {/* Simplified from provided HTML, focusing on h1 styling */}
      {/* Ensure font-display, text-textMain, dark:text-textMainDark are defined in your Tailwind config */}
      <h1 className="font-display text-pretty text-xl lg:text-3xl font-[500] dark:font-[475] text-textMain dark:text-textMainDark">
        {title}
      </h1>
    </div>
  );
};

// New tabs data and component structure
const tabsData = [
  {
    name: "Research",
    value: "research",
    icon: IconFileSearch,
    contentString: "Research Notes: Content for the research tab will appear here. This section can be used to display notes, findings, and sources related to the topic.",
    originalContent: (
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Research Notes</h3>
        <p className="text-sm text-muted-foreground">Content for the research tab will appear here. This section can be used to display notes, findings, and sources related to the topic.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 9 }).map((_, index) => (
            <Suspense key={`tweet-${index}`} fallback={<TweetSkeleton />}>
              <ClientTweetCard
                id={`tweet-placeholder-${index}`}
                analyzed={index % 2 === 0}
                onError={(error) => console.error("Tweet error:", error)}
              />
            </Suspense>
          ))}
        </div>
      </div>
    ),
  },
  {
    name: "Outline",
    value: "outline",
    icon: IconListDetails,
    contentString: "Content Outline: The generated or manually created outline for the content will be displayed here. This helps in structuring the script or article.",
    originalContent: (
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Content Outline</h3>
        <p className="text-sm text-muted-foreground">The generated or manually created outline for the content will be displayed here. This helps in structuring the script or article.</p>
        <ol className="space-y-2 list-decimal pl-5">
          <li>
            Introduction
            <ul className="list-disc pl-5 pt-1">
              <li>Problem statement</li>
              <li>Thesis and approach</li>
            </ul>
          </li>
          <li>Background</li>
        </ol>
      </div>
    ),
  },
  {
    name: "Script",
    value: "script",
    icon: IconFileText,
    contentString: "Script Draft: The main script or content draft will be available in this section. It can be edited and refined here.",
    originalContent: (
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Script Draft</h3>
        <p className="text-sm text-muted-foreground">The main script or content draft will be available in this section. It can be edited and refined here.</p>
        <div className="bg-muted p-4 rounded-md">
          <p className="mb-3">
            <span className="font-semibold">[SCENE START]</span>
          </p>
          <p className="mb-3">
            <span className="font-semibold">NARRATOR:</span> In a world where ideas flow like rivers...
          </p>
        </div>
      </div>
    ),
  },
];

const AiWriterTabs = () => {
  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content).then(() => {
      // Optional: Show a toast or confirmation
      console.log("Content copied to clipboard!");
    }).catch(err => {
      console.error("Failed to copy: ", err);
    });
  };

  return (
    <Tabs defaultValue={tabsData[0].value} className="w-full max-w-3xl mx-auto">
      <TabsList className="w-full p-0 bg-background justify-start border-b rounded-none">
        {tabsData.map((tab) => (
          <TabsTrigger
            key={tab.value}
            value={tab.value}
            className="rounded-none bg-background h-full data-[state=active]:shadow-none border-b-4 border-transparent data-[state=active]:border-primary px-4 py-2.5"
          >
            <tab.icon className="tabler-icon mr-2 h-4 w-4 shrink-0" />
            <code className="text-sm font-poppins">{tab.name}</code>
          </TabsTrigger>
        ))}
      </TabsList>
      {tabsData.map((tab) => (
        <TabsContent key={tab.value} value={tab.value} className="pt-6">
          {tab.originalContent}
        </TabsContent>
      ))}
    </Tabs>
  );
};

export default function AiWriterPage() {
  // This title would dynamically come from the "extracted idea"
  const ideaTitle = "Unveiling the Power of AI in Modern Storytelling";

  return (
    <AppProvider>
      <div className="flex flex-row min-h-screen bg-background">
        <AppSidebar />
        <MainContent>
          <div className="container mx-auto px-4 py-2 md:py-6">
            <PageTitle title={ideaTitle} />
            <AiWriterTabs />
          </div>
        </MainContent>
      </div>
    </AppProvider>
  );
} 