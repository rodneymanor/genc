'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import AppSidebar from "@/components/layout/AppSidebar";
import MainContent from "@/components/layout/MainContent";
import { AppProvider } from "@/contexts/AppContext";

export default function TestGeminiPage() {
  const [logs, setLogs] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [videoIdea, setVideoIdea] = useState("The surprising benefits of urban beekeeping for local ecosystems.");

  const handleRunTest = async () => {
    setIsLoading(true);
    setError(null);
    setLogs([]);
    try {
      const response = await fetch(`/api/test-gemini-search?videoIdea=${encodeURIComponent(videoIdea)}`);
      const data = await response.json();
      if (response.ok) {
        setLogs(data.logs || ["No logs returned from API."]);
        if (data.error) {
          setError(`API Error: ${data.error}`);
        }
      } else {
        setError(data.error || "Failed to run test. Check API route.");
        setLogs(data.logs || ["Error logs may be available."]);
      }
    } catch (err: any) {
      setError(`Network or parsing error: ${err.message}`);
      setLogs([`Error: ${err.message}`]);
    }
    setIsLoading(false);
  };

  return (
    <AppProvider>
      <div className="flex flex-row min-h-screen bg-background">
        <AppSidebar />
        <MainContent>
          <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold mb-4">Test Gemini Source Discovery</h1>
            
            <div className="mb-4">
              <label htmlFor="videoIdeaInput" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Video Idea:
              </label>
              <input 
                type="text"
                id="videoIdeaInput"
                value={videoIdea}
                onChange={(e) => setVideoIdea(e.target.value)}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                placeholder="Enter video idea here"
              />
            </div>

            <Button onClick={handleRunTest} disabled={isLoading}>
              {isLoading ? 'Running Test...' : 'Run Gemini Source Test'}
            </Button>

            {error && (
              <div className="mt-4 p-4 bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-200 rounded-md">
                <p className="font-semibold">Error:</p>
                <pre className="whitespace-pre-wrap">{error}</pre>
              </div>
            )}

            <div className="mt-6">
              <h2 className="text-xl font-semibold mb-2">Logs:</h2>
              {logs.length > 0 ? (
                <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md text-sm overflow-x-auto whitespace-pre-wrap">
                  {logs.join('\n')}
                </pre>
              ) : (
                <p className="text-gray-500 dark:text-gray-400">No logs yet. Click the button to run the test.</p>
              )}
            </div>
          </div>
        </MainContent>
      </div>
    </AppProvider>
  );
} 