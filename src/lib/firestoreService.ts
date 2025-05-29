import { db } from './firebase';
import {
  doc,
  setDoc,
  collection,
  addDoc,
  serverTimestamp,
  Timestamp,
  getDoc,
  updateDoc,
  query,
  where,
  getDocs,
  orderBy,
  limit
} from 'firebase/firestore';

export interface ScriptData {
  id?: string; // Firestore document ID
  userId: string;
  title: string; // Derived from videoIdea
  videoIdea: string;
  finalScriptText: string;
  selectedScriptItems?: object; // To store the selected outline components
  createdAt: Timestamp | Date; // Firestore Timestamp or Date for new objects
  updatedAt: Timestamp | Date; // Firestore Timestamp or Date for new objects
  // Add other relevant fields like version history pointer later
}

// Interface for data coming from the webhook processing
export interface AnalyzedVideoData {
  id?: string; // Firestore document ID, or ID from video source
  title: string;
  description?: string;
  thumbnailUrl?: string;
  duration?: string;
  platform: string; // e.g., 'youtube', 'tiktok', 'instagram', 'facebook', 'unknown'
  originalUrl: string;
  embedUrl?: string; // Direct link to video file
  transcript?: string;
  analysisReport?: any; // Could be a structured object or string
  processedAt: string; // ISO string date
  source: 'webhook'; // To identify how it was added
  processingError?: string; // Optional error message from webhook processing
  createdAt?: Timestamp | Date;
  updatedAt?: Timestamp | Date;
  authorUsername?: string; // Added based on webhook route usage
}

/**
 * Saves or updates a script for a given user.
 * If scriptId is provided and exists, it updates; otherwise, it creates a new script.
 */
export const saveScript = async (
  userId: string,
  scriptId: string | null,
  scriptContent: Omit<ScriptData, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
): Promise<string> => {
  if (!userId) {
    throw new Error("User ID is required to save a script.");
  }

  const now = serverTimestamp(); // Use serverTimestamp for consistent timing

  if (scriptId) {
    // Update existing script
    const scriptRef = doc(db, `users/${userId}/scripts`, scriptId);
    await updateDoc(scriptRef, {
      ...scriptContent,
      updatedAt: now,
    });
    console.log("Script updated with ID: ", scriptId);
    return scriptId;
  } else {
    // Create new script
    const userScriptsCollectionRef = collection(db, `users/${userId}/scripts`);
    const newScriptRef = await addDoc(userScriptsCollectionRef, {
      userId,
      ...scriptContent,
      createdAt: now,
      updatedAt: now,
    });
    console.log("New script saved with ID: ", newScriptRef.id);
    return newScriptRef.id;
  }
};

/**
 * Fetches all scripts for a given user, ordered by last updated.
 */
export const getUserScripts = async (userId: string): Promise<ScriptData[]> => {
  if (!userId) {
    console.error("User ID is required to fetch scripts.");
    return [];
  }
  try {
    const userScriptsCollectionRef = collection(db, `users/${userId}/scripts`);
    const q = query(userScriptsCollectionRef, orderBy("updatedAt", "desc"));
    const querySnapshot = await getDocs(q);
    const scripts: ScriptData[] = [];
    querySnapshot.forEach((doc) => {
      scripts.push({ id: doc.id, ...doc.data() } as ScriptData);
    });
    return scripts;
  } catch (error) {
    console.error("Error fetching user scripts:", error);
    return []; // Return empty array on error
  }
};

/**
 * Fetches a single script by its ID and user ID.
 */
export const getScriptById = async (userId: string, scriptId: string): Promise<ScriptData | null> => {
  if (!userId || !scriptId) {
    console.error("User ID and Script ID are required to fetch a script.");
    return null;
  }
  try {
    const scriptRef = doc(db, `users/${userId}/scripts`, scriptId);
    const docSnap = await getDoc(scriptRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as ScriptData;
    }
    console.warn("No such script found!");
    return null;
  } catch (error) {
    console.error("Error fetching script by ID:", error);
    return null;
  }
};

/**
 * Saves processed video data from a webhook to Firestore.
 */
export const saveAnalyzedVideo = async (
  videoData: Omit<AnalyzedVideoData, 'createdAt' | 'updatedAt'> // ID is part of AnalyzedVideoData and can be optional
): Promise<string> => {
  try {
    const now = serverTimestamp();
    const collectionRef = collection(db, 'analyzedVideos');
    
    let docIdToReturn: string;

    if (videoData.id) {
      const specificDocRef = doc(db, 'analyzedVideos', videoData.id);
      await setDoc(specificDocRef, {
        ...videoData,
        // When using setDoc with a specific ID, we are effectively creating or overwriting.
        // Set createdAt to now. If a more nuanced update (don't overwrite createdAt) is needed,
        // one would typically fetch the doc first to see if it exists.
        createdAt: now,
        updatedAt: now,
      });
      docIdToReturn = videoData.id;
      console.log("Analyzed video data saved/updated with specific ID: ", videoData.id);
    } else {
      const newDocRef = await addDoc(collectionRef, {
        ...videoData,
        createdAt: now,
        updatedAt: now,
      });
      docIdToReturn = newDocRef.id;
      console.log("New analyzed video data saved with auto-generated ID: ", newDocRef.id);
    }
    return docIdToReturn;
  } catch (error) {
    console.error("Error saving analyzed video data to Firestore:", error);
    // Type assertion for error message access
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to save analyzed video data: ${errorMessage}`);
  }
};

/**
 * Fetches all analyzed videos, ordered by creation date (newest first).
 * Optionally, a limit can be provided for pagination.
 */
export const getAnalyzedVideos = async (count?: number): Promise<AnalyzedVideoData[]> => {
  try {
    const videosCollectionRef = collection(db, 'analyzedVideos');
    const q = count 
      ? query(videosCollectionRef, orderBy("createdAt", "desc"), limit(count))
      : query(videosCollectionRef, orderBy("createdAt", "desc"));
      
    const querySnapshot = await getDocs(q);
    const videos: AnalyzedVideoData[] = [];
    querySnapshot.forEach((docSnap) => { // Renamed doc to docSnap to avoid conflict with firestore's doc function
      const data = docSnap.data();
      videos.push({
        id: docSnap.id,
        ...data,
        // Timestamps should be correctly serialized/deserialized by Firestore
      } as AnalyzedVideoData);
    });
    return videos;
  } catch (error) {
    console.error("Error fetching analyzed videos:", error);
    return [];
  }
}; 