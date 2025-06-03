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
  limit,
  writeBatch
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

// Interface for voice profile data
export interface VoiceProfileData {
  id?: string; // Firestore document ID
  userId: string;
  name: string; // Display name for the voice (e.g., "@username Voice Clone")
  platform: string; // 'instagram', 'tiktok', etc.
  sourceProfile: {
    username: string;
    profileUrl: string;
    displayName?: string;
    profileImage?: string;
  };
  voiceProfile: {
    coreIdentity: {
      suggestedPersonaName: string;
      dominantTones: string[];
      secondaryTones: string[];
      toneExemplars: string[];
      uniqueIdentifiersOrQuirks: string[];
    };
    contentStrategyBlueprints?: any; // Can be expanded based on API response
    linguisticAndDeliveryEssence?: any;
    actionableSystemPromptComponents: {
      voiceDnaSummaryDirectives: string[];
      consolidatedNegativeConstraints?: any;
    };
  };
  analysisData: {
    videosAnalyzed: number;
    totalVideosFound: number;
    createdAt: string; // ISO string date of analysis
  };
  status: 'ready' | 'training' | 'error';
  isActive: boolean;
  postsCreated: number;
  createdAt: Timestamp | Date;
  updatedAt: Timestamp | Date;
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
export const getUserScripts = async (userId: string, limitCount?: number): Promise<ScriptData[]> => {
  if (!userId) {
    console.error("User ID is required to fetch scripts.");
    return [];
  }
  try {
    const userScriptsCollectionRef = collection(db, `users/${userId}/scripts`);
    const q = limitCount
      ? query(userScriptsCollectionRef, orderBy("updatedAt", "desc"), limit(limitCount))
      : query(userScriptsCollectionRef, orderBy("updatedAt", "desc"));
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

/**
 * Saves a voice profile for a given user.
 */
export const saveVoiceProfile = async (
  userId: string,
  voiceProfileData: Omit<VoiceProfileData, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
): Promise<string> => {
  if (!userId) {
    throw new Error("User ID is required to save a voice profile.");
  }

  try {
    const now = serverTimestamp();
    const userVoicesCollectionRef = collection(db, `users/${userId}/voiceProfiles`);
    
    const newVoiceRef = await addDoc(userVoicesCollectionRef, {
      userId,
      ...voiceProfileData,
      createdAt: now,
      updatedAt: now,
    });
    
    console.log("New voice profile saved with ID: ", newVoiceRef.id);
    return newVoiceRef.id;
  } catch (error) {
    console.error("Error saving voice profile to Firestore:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to save voice profile: ${errorMessage}`);
  }
};

/**
 * Fetches all voice profiles for a given user, ordered by creation date.
 */
export const getUserVoiceProfiles = async (userId: string, limitCount?: number): Promise<VoiceProfileData[]> => {
  if (!userId) {
    console.error("User ID is required to fetch voice profiles.");
    return [];
  }
  
  try {
    const userVoicesCollectionRef = collection(db, `users/${userId}/voiceProfiles`);
    const q = limitCount
      ? query(userVoicesCollectionRef, orderBy("createdAt", "desc"), limit(limitCount))
      : query(userVoicesCollectionRef, orderBy("createdAt", "desc"));
    
    const querySnapshot = await getDocs(q);
    const voiceProfiles: VoiceProfileData[] = [];
    
    querySnapshot.forEach((doc) => {
      voiceProfiles.push({ id: doc.id, ...doc.data() } as VoiceProfileData);
    });
    
    return voiceProfiles;
  } catch (error) {
    console.error("Error fetching user voice profiles:", error);
    return [];
  }
};

/**
 * Fetches a single voice profile by its ID and user ID.
 */
export const getVoiceProfileById = async (userId: string, voiceProfileId: string): Promise<VoiceProfileData | null> => {
  if (!userId || !voiceProfileId) {
    console.error("User ID and Voice Profile ID are required to fetch a voice profile.");
    return null;
  }
  
  try {
    const voiceProfileRef = doc(db, `users/${userId}/voiceProfiles`, voiceProfileId);
    const docSnap = await getDoc(voiceProfileRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as VoiceProfileData;
    }
    
    console.warn("No such voice profile found!");
    return null;
  } catch (error) {
    console.error("Error fetching voice profile by ID:", error);
    return null;
  }
};

/**
 * Updates a voice profile (e.g., to change active status, increment posts created).
 */
export const updateVoiceProfile = async (
  userId: string,
  voiceProfileId: string,
  updates: Partial<Omit<VoiceProfileData, 'id' | 'userId' | 'createdAt'>>
): Promise<void> => {
  if (!userId || !voiceProfileId) {
    throw new Error("User ID and Voice Profile ID are required to update a voice profile.");
  }

  try {
    const voiceProfileRef = doc(db, `users/${userId}/voiceProfiles`, voiceProfileId);
    await updateDoc(voiceProfileRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
    
    console.log("Voice profile updated with ID: ", voiceProfileId);
  } catch (error) {
    console.error("Error updating voice profile:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to update voice profile: ${errorMessage}`);
  }
};

/**
 * Deletes a voice profile.
 */
export const deleteVoiceProfile = async (userId: string, voiceProfileId: string): Promise<void> => {
  if (!userId || !voiceProfileId) {
    throw new Error("User ID and Voice Profile ID are required to delete a voice profile.");
  }

  try {
    const voiceProfileRef = doc(db, `users/${userId}/voiceProfiles`, voiceProfileId);
    await updateDoc(voiceProfileRef, {
      status: 'deleted',
      updatedAt: serverTimestamp(),
    });
    
    console.log("Voice profile marked as deleted with ID: ", voiceProfileId);
  } catch (error) {
    console.error("Error deleting voice profile:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to delete voice profile: ${errorMessage}`);
  }
};

/**
 * Sets a voice profile as active and deactivates all others for the user.
 */
export const setActiveVoiceProfile = async (userId: string, voiceProfileId: string): Promise<void> => {
  if (!userId || !voiceProfileId) {
    throw new Error("User ID and Voice Profile ID are required to set active voice profile.");
  }

  try {
    const userVoicesCollectionRef = collection(db, `users/${userId}/voiceProfiles`);
    
    // First, deactivate all voice profiles for this user
    const allVoicesQuery = query(userVoicesCollectionRef, where("isActive", "==", true));
    const querySnapshot = await getDocs(allVoicesQuery);
    
    const batch = writeBatch(db);
    querySnapshot.forEach((doc) => {
      batch.update(doc.ref, { isActive: false, updatedAt: serverTimestamp() });
    });
    
    // Then activate the selected voice profile
    const targetVoiceRef = doc(db, `users/${userId}/voiceProfiles`, voiceProfileId);
    batch.update(targetVoiceRef, { isActive: true, updatedAt: serverTimestamp() });
    
    await batch.commit();
    console.log("Voice profile activated with ID: ", voiceProfileId);
  } catch (error) {
    console.error("Error setting active voice profile:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to set active voice profile: ${errorMessage}`);
  }
};

/**
 * Gets the currently active voice profile for a user.
 */
export const getActiveVoiceProfile = async (userId: string): Promise<VoiceProfileData | null> => {
  if (!userId) {
    console.error("User ID is required to fetch active voice profile.");
    return null;
  }

  try {
    const userVoicesCollectionRef = collection(db, `users/${userId}/voiceProfiles`);
    const activeVoiceQuery = query(
      userVoicesCollectionRef, 
      where("isActive", "==", true),
      where("status", "==", "ready"),
      limit(1)
    );
    
    const querySnapshot = await getDocs(activeVoiceQuery);
    
    if (querySnapshot.empty) {
      console.log("No active voice profile found for user:", userId);
      return null;
    }
    
    const doc = querySnapshot.docs[0];
    return { id: doc.id, ...doc.data() } as VoiceProfileData;
  } catch (error) {
    console.error("Error fetching active voice profile:", error);
    return null;
  }
};

/**
 * Deactivates all voice profiles for a user.
 */
export const deactivateAllVoiceProfiles = async (userId: string): Promise<void> => {
  if (!userId) {
    throw new Error("User ID is required to deactivate voice profiles.");
  }

  try {
    const userVoicesCollectionRef = collection(db, `users/${userId}/voiceProfiles`);
    const activeVoicesQuery = query(userVoicesCollectionRef, where("isActive", "==", true));
    const querySnapshot = await getDocs(activeVoicesQuery);
    
    if (querySnapshot.empty) {
      console.log("No active voice profiles to deactivate for user:", userId);
      return;
    }

    const batch = writeBatch(db);
    querySnapshot.forEach((doc) => {
      batch.update(doc.ref, { isActive: false, updatedAt: serverTimestamp() });
    });
    
    await batch.commit();
    console.log("All voice profiles deactivated for user:", userId);
  } catch (error) {
    console.error("Error deactivating voice profiles:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to deactivate voice profiles: ${errorMessage}`);
  }
}; 