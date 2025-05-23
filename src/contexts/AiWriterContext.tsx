'use client';
import React, { createContext, useContext, useState, ReactNode } from 'react';
import type { ScriptComponents, UserSelectedScriptComponents, ScriptHook, ScriptFactset, ScriptTake, ScriptOutro } from '@/lib/types/scriptComponents'; // Import all necessary types

export interface Source {
  title: string;
  link: string;
  snippet: string;
  id?: string; // Optional: if your ClientTweetCard needs an ID not from API
  extractedText?: string;
  isTextExtracted?: boolean;
  textExtractionError?: string;
}

interface AiWriterContextType {
  isProcessing: boolean;
  setIsProcessing: (isProcessing: boolean) => void;
  currentStep: string | null;
  setCurrentStep: (step: string | null) => void;
  processingError: string | null;
  setProcessingError: (error: string | null) => void;
  errorStep: string | null;
  setErrorStep: (step: string | null) => void;
  sources: Source[];
  setSources: (sources: Source[]) => void;
  videoIdea: string;
  setVideoIdea: (idea: string) => void;
  isAiWriterSearchActive: boolean;
  setIsAiWriterSearchActive: (isActive: boolean) => void;
  triggerSearch: (idea: string) => Promise<void>;

  // Content Extraction State
  isExtractingContent: boolean;
  setIsExtractingContent: (isLoading: boolean) => void;
  contentExtractionError: string | null;
  setContentExtractionError: (error: string | null) => void;
  extractContentFromAllSources: (currentSourcesParam?: Source[]) => Promise<void>;

  // Research Analysis State
  researchAnalysis: { researchAnalysisText: string } | null;
  setResearchAnalysis: (analysis: { researchAnalysisText: string } | null) => void;
  isLoadingResearchAnalysis: boolean;
  setIsLoadingResearchAnalysis: (isLoading: boolean) => void;
  researchAnalysisError: string | null;
  setResearchAnalysisError: (error: string | null) => void;

  // New state for script component generation
  scriptComponents: ScriptComponents | null;
  setScriptComponents: (components: ScriptComponents | null) => void;
  isLoadingScriptComponents: boolean;
  setIsLoadingScriptComponents: (isLoading: boolean) => void;
  scriptComponentsError: string | null;
  setScriptComponentsError: (error: string | null) => void;
  userSelectedComponents: UserSelectedScriptComponents | null;
  setUserSelectedComponents: (selected: UserSelectedScriptComponents | null) => void;
  updateSelectedHook: (hook: ScriptHook | null) => void;
  updateSelectedFactsets: (factset: ScriptFactset, isSelected: boolean) => void;
  updateSelectedTake: (take: ScriptTake | null) => void;
  updateSelectedOutro: (outro: ScriptOutro | null) => void;
  generateScriptComponents: () => Promise<void>; // New function to trigger component generation
  analyzeAndGenerateOutlines: () => Promise<void>; // New function placeholder

  // New state for final script generation
  finalScript: string | null;
  setFinalScript: (script: string | null) => void;
  isLoadingFinalScript: boolean;
  setIsLoadingFinalScript: (isLoading: boolean) => void;
  finalScriptError: string | null;
  setFinalScriptError: (error: string | null) => void;
  generateFinalScript: () => Promise<void>; // Function to trigger final script generation
}

export const AiWriterContext = createContext<AiWriterContextType | undefined>(undefined);

export const AiWriterProvider = ({ children }: { children: ReactNode }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState<string | null>("init");
  const [processingError, setProcessingError] = useState<string | null>(null);
  const [errorStep, setErrorStep] = useState<string | null>(null);
  const [sources, setSources] = useState<Source[]>([]);
  const [videoIdea, setVideoIdea] = useState("");
  const [isAiWriterSearchActive, setIsAiWriterSearchActive] = useState(false);

  // Content Extraction State
  const [isExtractingContent, setIsExtractingContent] = useState(false);
  const [contentExtractionError, setContentExtractionError] = useState<string | null>(null);

  // Research Analysis State
  const [researchAnalysis, setResearchAnalysis] = useState<{ researchAnalysisText: string } | null>(null);
  const [isLoadingResearchAnalysis, setIsLoadingResearchAnalysis] = useState(false);
  const [researchAnalysisError, setResearchAnalysisError] = useState<string | null>(null);

  // New state for script components
  const [scriptComponents, setScriptComponents] = useState<ScriptComponents | null>(null);
  const [isLoadingScriptComponents, setIsLoadingScriptComponents] = useState(false);
  const [scriptComponentsError, setScriptComponentsError] = useState<string | null>(null);
  const [userSelectedComponents, setUserSelectedComponentsState] = useState<UserSelectedScriptComponents | null>(null);

  // New state for final script
  const [finalScript, setFinalScript] = useState<string | null>(null);
  const [isLoadingFinalScript, setIsLoadingFinalScript] = useState(false);
  const [finalScriptError, setFinalScriptError] = useState<string | null>(null);

  const setUserSelectedComponents = (selected: UserSelectedScriptComponents | null) => {
    setUserSelectedComponentsState(selected);
  };

  const updateSelectedHook = (hook: ScriptHook | null) => {
    setUserSelectedComponentsState(prev => ({ ...(prev || { hook: null, factsets: [], take: null, outro: null }), hook }));
  };

  const updateSelectedFactsets = (factset: ScriptFactset, isSelected: boolean) => {
    setUserSelectedComponentsState(prev => {
      if (!prev) {
        // Initialize if null, though this case should ideally be handled by initial state or prior selections
        return { hook: null, factsets: isSelected ? [factset] : [], take: null, outro: null };
      }

      let currentFactsets = prev.factsets || [];
      const uniqueCategoriesForSingleSelection = ["Bridge", "MicroHook", "GoldenNugget"]; // Categories that allow only one selection

      if (isSelected) {
        // If the selected factset belongs to a unique category, remove others of the same category first
        if (uniqueCategoriesForSingleSelection.includes(factset.category)) {
          currentFactsets = currentFactsets.filter(f => f.category !== factset.category);
        }
        // Add the new factset
        // Prevent adding duplicates if not a unique category (though for unique, filter already handles it)
        if (!currentFactsets.some(f => f.content === factset.content && f.category === factset.category)) {
            currentFactsets = [...currentFactsets, factset];
        }
      } else {
        // If deselecting (though not directly via RadioGroup), remove it
        currentFactsets = currentFactsets.filter(f => !(f.content === factset.content && f.category === factset.category));
      }
      return { ...prev, factsets: currentFactsets };
    });
  };

  const updateSelectedTake = (take: ScriptTake | null) => {
    setUserSelectedComponentsState(prev => ({ ...(prev || { hook: null, factsets: [], take: null, outro: null }), take }));
  };

  const updateSelectedOutro = (outro: ScriptOutro | null) => {
    setUserSelectedComponentsState(prev => ({ ...(prev || { hook: null, factsets: [], take: null, outro: null }), outro }));
  };

  const extractContentFromAllSources = async (currentSourcesParam?: Source[]) => {
    const sourcesToProcess = currentSourcesParam || sources;
    if (!sourcesToProcess || sourcesToProcess.length === 0) {
      setProcessingError("No sources available to extract content from.");
      setIsProcessing(false);
      setCurrentStep("extract_failed");
      setErrorStep("extract");
      return;
    }
    setCurrentStep("extract");
    if (!isProcessing) setIsProcessing(true);

    const controller = new AbortController();
    const extractionTimeoutId = setTimeout(() => {
        controller.abort();
        console.error(`Content extraction for multiple sources timed out`);
        setProcessingError("Content extraction for one or more sources took too long.");
        setErrorStep("extract");
        setCurrentStep("extract_failed");
        setIsProcessing(false);
    }, 45000);

    let firstErrorEncountered: string | null = null;
    let anySourceFailed = false;

    const updatedSources = await Promise.all(
      sourcesToProcess.map(async (source) => {
        if (source.isTextExtracted && !source.textExtractionError) return source; 

        const singleSourceController = new AbortController();
        const singleExtractionTimeoutId = setTimeout(() => {
          singleSourceController.abort();
          console.error(`Content extraction timed out for ${source.link}`);
        }, 20000);

        try {
          const response = await fetch('/api/extract-content', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: source.link }),
            signal: singleSourceController.signal,
          });
          clearTimeout(singleExtractionTimeoutId);

          if (!response.ok) {
            let apiErrorMessage = "Extraction failed";
            try {
                const errorData = await response.json();
                apiErrorMessage = errorData.message || `Server responded with ${response.status}`;
            } catch (e) {
                apiErrorMessage = `Server responded with ${response.status}, no details.`;
            }
            
            const errorMessage = `Failed for ${new URL(source.link).hostname}: ${apiErrorMessage}`;
            if (!firstErrorEncountered) firstErrorEncountered = errorMessage;
            anySourceFailed = true;
            return { ...source, isTextExtracted: false, textExtractionError: apiErrorMessage };
          }
          const data = await response.json();
          return { ...source, extractedText: data.text, isTextExtracted: true, textExtractionError: undefined };
        } catch (error: any) {
          clearTimeout(singleExtractionTimeoutId);
          let errorMessage = "Network or client-side error during extraction";
          if (error.name === 'AbortError') {
            errorMessage = "Extraction timed out";
          } else if (error.message) {
            errorMessage = error.message;
          }
          
          const sourceSpecificError = `Error for ${new URL(source.link).hostname}: ${errorMessage}`;
          if (!firstErrorEncountered) firstErrorEncountered = sourceSpecificError;
          anySourceFailed = true;
          return { ...source, isTextExtracted: false, textExtractionError: errorMessage };
        }
      })
    );
    
    clearTimeout(extractionTimeoutId);
    setSources(updatedSources);

    if (anySourceFailed) {
      const finalErrorMessage = `Some content could not be extracted. First error: ${firstErrorEncountered || "Unknown extraction error"}`;
      setProcessingError(finalErrorMessage);
      setErrorStep("extract");
      setCurrentStep("extract_issues");
    } else {
      setProcessingError(null); 
      setErrorStep(null);
      setCurrentStep("analyze_ready"); 
    }
    
    if (firstErrorEncountered) {
        setIsProcessing(false);
    } else {
        setIsProcessing(false);
    }
  };

  // Simulates the search process and updates context state
  const triggerSearch = async (idea: string) => {
    console.log("[AiWriterContext] triggerSearch CALLED with idea:", idea);

    if (!idea.trim()) {
      setProcessingError("Video idea cannot be empty.");
      setIsProcessing(false);
      setCurrentStep("init");
      console.log("[AiWriterContext] triggerSearch: Idea empty, processing set to false, step to init");
      return;
    }
    setVideoIdea(idea);
    setIsProcessing(true);
    setCurrentStep("search");
    console.log("[AiWriterContext] triggerSearch: States set - isProcessing: true, currentStep: search");

    setSources([]);
    setScriptComponents(null);
    setUserSelectedComponentsState({ hook: null, factsets: [], take: null, outro: null });
    setFinalScript(null);
    setResearchAnalysis(null);
    setProcessingError(null);
    setErrorStep(null);
    setContentExtractionError(null); 

    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
      console.error("Search API call timed out after 45 seconds");
      setProcessingError("The search for sources took too long to respond. Please try again.");
      setErrorStep("search");
      setIsProcessing(false);
      setCurrentStep("search_failed");
    }, 45000); 

    try {
      const response = await fetch(`/api/test-gemini-search?videoIdea=${encodeURIComponent(idea)}`, {
        method: 'GET',
        signal: controller.signal, 
      });

      clearTimeout(timeoutId); 

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: "Unknown error during search" }));
        throw new Error(`Search failed: ${response.status} ${response.statusText}. ${errorData.message || 'Unknown server error'}`);
      }

      const data = await response.json();
      console.log("[AiWriterContext] Raw data object from API:", data);

      setSources(data.sources || []); 

      if (data.sources && data.sources.length > 0) {
        await extractContentFromAllSources(data.sources); 
      } else {
        setProcessingError("No sources found for your idea. Try a different topic or wording.");
        setIsProcessing(false); 
        setCurrentStep("search_empty");
      }
    } catch (error: any) {
      clearTimeout(timeoutId); 
      console.error("Error in triggerSearch:", error);
      if (error.name === 'AbortError') {
      } else {
        setProcessingError(error.message || "An unexpected error occurred during search.");
        setErrorStep("search");
        setIsProcessing(false);
        setCurrentStep("search_failed");
      }
    } 
  };

  const generateScriptComponents = async () => {
    if (!videoIdea || sources.length === 0) {
      setScriptComponentsError("Cannot generate script components without a video idea and research sources.");
      return;
    }
    setIsLoadingScriptComponents(true);
    setScriptComponentsError(null);
    setScriptComponents(null);
    setUserSelectedComponents(null);
    setFinalScript(null);
    setFinalScriptError(null);

    try {
      const response = await fetch('/api/generate-script-components', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoIdea, researchSources: sources }),
      });

      const data: ScriptComponents | { message: string; rawResponse?: string; error?: string } = await response.json();
      console.log("[Context] Script Component API Response Data:", data);

      if (!response.ok) {
        const errorMsg = (data as { message: string }).message || "Failed to generate script components.";
        console.error("[Context] API Error for script components:", errorMsg, (data as {rawResponse?: string}).rawResponse || (data as {error?: string}).error);
        throw new Error(errorMsg);
      }
      if ('hooks' in data && 'factsets' in data && 'takes' in data && 'outros' in data) {
         setScriptComponents(data as ScriptComponents);
      } else {
        throw new Error("Received malformed script component data from API.");
      }

    } catch (err: any) {
      console.error("[Context] Script component generation error:", err);
      setScriptComponentsError(err.message || "An unknown error occurred during script component generation.");
    } finally {
      setIsLoadingScriptComponents(false);
    }
  };

  const analyzeAndGenerateOutlines = async () => {
    const sourcesForAnalysis = sources.filter(s => s.isTextExtracted && s.extractedText);
    if (sourcesForAnalysis.length === 0) {
      setResearchAnalysisError("No successfully extracted source content available for analysis. Please check the Research tab.");
      setIsProcessing(false);
      setCurrentStep("analyze_failed");
      return;
    }

    setCurrentStep("analyze"); 
    setIsLoadingResearchAnalysis(true);
    setResearchAnalysis(null);
    setResearchAnalysisError(null);
    
    setScriptComponents(null);
    setScriptComponentsError(null);
    setUserSelectedComponents(null);
    setFinalScript(null);
    setFinalScriptError(null);

    try {
      const sourceContentsForApi = sourcesForAnalysis.map(s => ({
        link: s.link,
        title: s.title,
        text: s.extractedText || '' 
      }));

      const response = await fetch('/api/create-research-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoIdea, sourceContents: sourceContentsForApi }),
      });

      const data = await response.json();

      if (!response.ok || !data.researchAnalysisText) {
        console.error("Error creating research analysis:", data.error, data.logs);
        throw new Error(data.error || "Failed to generate research analysis text from API.");
      }

      setResearchAnalysis({ researchAnalysisText: data.researchAnalysisText });
      console.log(`[Context] Research analysis created: ${data.researchAnalysisText.substring(0,100)}...`);
      setIsLoadingResearchAnalysis(false);
      setCurrentStep("generate_options"); 

      setIsLoadingScriptComponents(true);
      setScriptComponents(null);
      setScriptComponentsError(null);

      try {
        const componentsResponse = await fetch('/api/generate-script-components', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ videoIdea, researchAnalysisText: data.researchAnalysisText }),
        });

        const componentsData: ScriptComponents | { message: string; rawResponse?: string; error?: string, errorDetails?: string, blockReason?: string, safetyRatings?: any, promptFeedback?: any } = await componentsResponse.json();
        
        if (!componentsResponse.ok) {
          const errorMsg = (componentsData as any).message || "Failed to generate script components from API.";
          console.error("[Context] API Error for script components:", errorMsg, componentsData);
          throw new Error(errorMsg);
        }

        if ('hooks' in componentsData && 'factsets' in componentsData && 'outros' in componentsData) {
          setScriptComponents(componentsData as ScriptComponents);
          console.log("[Context] Script components generated successfully.");
          setCurrentStep("outline_ready"); 
        } else {
          console.error("[Context] Received malformed script component data:", componentsData);
          throw new Error("Received malformed script component data from API.");
        }

      } catch (compError: any) {
        console.error("[Context] Script component generation error (after analysis):", compError);
        setScriptComponentsError(compError.message || "An unknown error occurred during script component generation.");
        setErrorStep("generate_options"); 
        setCurrentStep("generate_failed");
      } finally {
        setIsLoadingScriptComponents(false);
      }

    } catch (error: any) {
      console.error("Error during research analysis generation:", error);
      setResearchAnalysisError(error.message || "Failed to create research analysis.");
      setErrorStep("analyze"); 
      setCurrentStep("analyze_failed");
      setIsLoadingResearchAnalysis(false);
      setIsLoadingScriptComponents(false); 
    }
  };

  const generateFinalScript = async () => {
    if (!videoIdea || !userSelectedComponents) {
      setFinalScriptError("Video idea and selected script components are required to generate the final script.");
      return;
    }
    if (!userSelectedComponents.hook || userSelectedComponents.factsets.length === 0 || !userSelectedComponents.take || !userSelectedComponents.outro) {
      setFinalScriptError("All component types (Hook, Factsets, Take, Outro) must be selected.");
      return;
    }

    setIsLoadingFinalScript(true);
    setFinalScriptError(null);
    setFinalScript(null);

    try {
      const response = await fetch('/api/generate-final-script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoIdea, selectedComponents: userSelectedComponents }),
      });

      const data: { script?: string; message?: string; error?: string } = await response.json();
      console.log("[Context] Final Script API Response Data:", data);

      if (!response.ok || !data.script) {
        const errorMsg = data.message || data.error || "Failed to generate final script.";
        throw new Error(errorMsg);
      }
      setFinalScript(data.script);

    } catch (err: any) {
      console.error("[Context] Final script generation error:", err);
      setFinalScriptError(err.message || "An unknown error occurred during final script generation.");
    } finally {
      setIsLoadingFinalScript(false);
    }
  };

  return (
    <AiWriterContext.Provider value={{
      isProcessing, setIsProcessing,
      currentStep, setCurrentStep,
      processingError, setProcessingError,
      errorStep, setErrorStep,
      sources, setSources,
      videoIdea, setVideoIdea,
      isAiWriterSearchActive, setIsAiWriterSearchActive,
      triggerSearch,
      isExtractingContent,
      setIsExtractingContent,
      contentExtractionError,
      setContentExtractionError,
      extractContentFromAllSources,
      researchAnalysis,
      setResearchAnalysis,
      isLoadingResearchAnalysis,
      setIsLoadingResearchAnalysis,
      researchAnalysisError,
      setResearchAnalysisError,
      scriptComponents, setScriptComponents,
      isLoadingScriptComponents, setIsLoadingScriptComponents,
      scriptComponentsError, setScriptComponentsError,
      userSelectedComponents, setUserSelectedComponents,
      updateSelectedHook, updateSelectedFactsets, updateSelectedTake, updateSelectedOutro,
      generateScriptComponents,
      analyzeAndGenerateOutlines,
      finalScript, setFinalScript,
      isLoadingFinalScript, setIsLoadingFinalScript,
      finalScriptError, setFinalScriptError,
      generateFinalScript
    }}>
      {children}
    </AiWriterContext.Provider>
  );
};

export const useAiWriterContext = (): AiWriterContextType => {
  const context = useContext(AiWriterContext);
  if (context === undefined) {
    throw new Error('useAiWriterContext must be used within an AiWriterProvider');
  }
  return context;
}; 