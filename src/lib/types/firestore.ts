import { Timestamp } from 'firebase/firestore';
import type { ScriptHook, ScriptFactset, ScriptTake, ScriptOutro, ScriptComponents as GeneratedScriptComponents, UserSelectedScriptComponents as UserSelectedAiWriterComponents } from './scriptComponents'; // Import the actual types

// 1. User Profile
export interface UserProfile {
  uid: string; // Document ID, from Firebase Auth
  email: string | null;
  displayName?: string | null;
  photoURL?: string | null;
  createdAt: Timestamp;
  updatedAt?: Timestamp;
  preferences?: {
    theme?: 'light' | 'dark' | 'system';
    notifications?: {
      email?: boolean;
      inApp?: boolean;
    };
  };
  subscriptionStatus?: 'free' | 'basic' | 'premium' | 'trial';
  credits?: number; // For features like number of AI runs etc.
  // Stripe customer ID, if using Stripe for subscriptions
  stripeCustomerId?: string; 
  lastLogin?: Timestamp;
  
  // Topics and Overview for content generation
  overview?: string; // Brief description/elevator pitch
  topics?: string | string[]; // Array of topics they speak about (legacy) or plain English description (new)
  fullName?: string; // User's full name for profile display and requirements
}

// 2. AI Writer Execution (Represents a full AI Writer session for a video idea)
export interface AiWriterSource {
  id: string; // From search result or a generated ID
  title: string;
  link: string;
  snippet?: string;
  retrievedAt: Timestamp;
  // Add any other relevant fields from your current Source type
  // For example, if you have 'user', 'handle', 'verified' etc. from tweetData
  user?: { 
    name?: string;
    handle?: string;
    verified?: boolean;
  };
  analyzed?: boolean; // if it's from tweetData structure
}

// Use the imported UserSelectedScriptComponents directly if it matches the structure needed for Firestore
// Or redefine if the Firestore structure needs to be different (e.g. storing only IDs or a subset of data)
export type AiWriterSelectedOutlineComponent = UserSelectedAiWriterComponents;

export interface AiWriterExecution {
  id?: string; // Firestore document ID
  userId: string; // Links to UserProfile.uid
  videoIdea: string;
  status: 'pending' | 'researching' | 'outlining' | 'scripting' | 'generating_final_script' | 'completed' | 'failed' | 'cancelled';
  createdAt: Timestamp;
  updatedAt?: Timestamp;
  errorMessage?: string;
  researchSources?: AiWriterSource[];
  // Store the generated components before user selection
  generatedOutlineComponents?: GeneratedScriptComponents; // Use the imported type
  userSelectedOutlineComponents?: AiWriterSelectedOutlineComponent; // Use the defined type above
  generatedScript?: string;
  scriptVersion?: number; // For iteration/history
  // Include any state from AiWriterContext that needs to be persisted per execution
  // For example: currentStep, errorStep, processingError for each major phase
  researchProgress?: {
    currentStep?: number;
    errorStep?: number;
    processingError?: string | null;
  };
  outlineGenerationProgress?: {
    isLoading?: boolean;
    error?: string | null; // Matches existing context
  };
  finalScriptGenerationProgress?: {
    isLoading?: boolean;
    error?: string | null; // Matches existing context
  };
}


// 3. Video Details Cache
export interface VideoDetails {
  id?: string; // Firestore document ID (could be normalized video URL or platform ID)
  videoUrl: string; // The original URL provided
  platform: 'tiktok' | 'instagram' | 'youtube' | 'twitter' | 'unknown';
  platformVideoId?: string; // Platform specific ID, e.g. YouTube video ID
  title?: string;
  description?: string;
  uploader?: string;
  uploaderUrl?: string;
  authorUsername?: string; // From analysisData.stats
  authorFollowers?: number; // From analysisData.stats
  uploadDate?: Timestamp; // Or string if not always a Timestamp
  publishedAt?: string; // From analysisData.stats.date
  duration?: number; // in seconds
  thumbnailUrl?: string;
  dimensions?: { // From analysisData.stats
    height?: number;
    width?: number;
  };
  stats?: { // Consider nesting raw stats if they differ from top-level convenience fields
    playCount?: number;
    likeCount?: number;
    commentCount?: number;
    viewCount?: number; // Some platforms use 'view' instead of 'play'
    shareCount?: number;
    saveCount?: number;
  };
  transcript?: string; // Full transcript if available
  transcriptLanguage?: string;
  caption?: string; // Short caption/text accompanying the video
  tags?: string[];
  category?: string;
  rawPlatformData?: any; // To store the original API response from the platform
  lastFetchedAt: Timestamp;
  lastAnalyzedAt?: Timestamp; // When an analysis report was last generated for this
}

// 4. Script Component Library (User-saved or System Templates)
export interface ScriptComponent {
  id?: string; // Firestore document ID
  userId?: string | null; // Null for system/global templates, UserProfile.uid for user-specific
  type: 'hook' | 'intro' | 'factset' | 'example' | 'story' | 'transition' | 'take' | 'call_to_action' | 'outro' | 'sound_effect_cue' | 'visual_cue';
  category?: string; // e.g., "Statistics", "Historical Context" for factsets; "Opening", "Closing" for outros
  title?: string; // User-defined title for the component
  content: string; // The actual text or script piece
  // For components that are structured (e.g. hook with lines), you might want a more complex type
  // contentStructured?: { title: string, lines: string[] }; 
  tags?: string[]; // For searchability
  sourceVideoUrl?: string; // Optional: URL of the video it was inspired by/derived from
  sourceVideoTitle?: string; // Optional
  usageCount?: number;
  rating?: number; // User or system rating
  isFavorite?: boolean; // User-specific
  createdAt: Timestamp;
  updatedAt?: Timestamp;
  privacy?: 'private' | 'shared_with_team' | 'public_template'; // If you implement teams/sharing
}

// 5. Analysis Reports (Results from the video analysis engine)
export interface AnalysisReport {
  id?: string; // Firestore document ID
  userId: string; // Links to UserProfile.uid
  aiWriterExecutionId?: string; // Optional: link to an AI Writer session if this analysis was part of it
  videoUrl: string; // The URL that was analyzed
  videoId?: string; // Optional: links to VideoDetailsCache.id or platform specific ID
  
  // Fields from existing AnalysisReport in analysis/page.tsx
  title?: string; 
  // Stats are duplicated here and in VideoDetails. Decide on Single Source of Truth.
  // Option 1: Store stats directly in AnalysisReport (as it is now)
  // Option 2: Reference VideoDetailsCache.id and fetch stats from there
  // For now, keeping structure similar to current app state:
  stats?: {
    play_count?: number;
    like_count?: number;
    comment_count?: number;
    video_duration?: number; // seconds
    author_username?: string;
    author_followers?: number;
    dimensions?: {
      height?: number;
      width?: number;
    };
    date?: string; // Publication date of video
  };
  reportText: string; // Markdown report from Gemini

  // Additional metadata for the report itself
  generatedAt: Timestamp;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  errorMessage?: string;
  analysisEngineVersion?: string; // Version of your analysis logic/prompt
  promptUsed?: string; // The prompt sent to Gemini (for debugging/auditing)
}

// General purpose type for references if needed
export interface FirestoreDocRef {
  collection: string;
  id: string;
} 