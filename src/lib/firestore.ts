import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
  Timestamp // Import Timestamp for date fields
} from 'firebase/firestore';
import { db } from '@/lib/firebase'; // Adjusted path

// Interface for common data structure (optional, but good practice)
interface BaseDocument {
  id?: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

// Create a new document
export const createDocument = async <T extends BaseDocument>(
  collectionName: string,
  data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, collectionName), {
      ...data,
      createdAt: Timestamp.now() // Use Firestore Timestamp
    });
    return docRef.id;
  } catch (error) {
    console.error("Error adding document:", error);
    throw error;
  }
};

// Get all documents from a collection
export const getDocuments = async <T extends BaseDocument>(
  collectionName: string
): Promise<T[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, collectionName));
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as T));
  } catch (error) {
    console.error("Error getting documents:", error);
    throw error;
  }
};

// Get documents with a where clause
export const getDocumentsWhere = async <T extends BaseDocument>(
  collectionName: string,
  field: string,
  operator: import('firebase/firestore').WhereFilterOp,
  value: any
): Promise<T[]> => {
  try {
    const q = query(collection(db, collectionName), where(field, operator, value));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as T));
  } catch (error) {
    console.error("Error querying documents:", error);
    throw error;
  }
};

// Get a single document
export const getDocument = async <T extends BaseDocument>(
  collectionName: string,
  id: string
): Promise<T | null> => {
  try {
    const docRef = doc(db, collectionName, id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as T;
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error getting document:", error);
    throw error;
  }
};

// Update a document
export const updateDocument = async <T extends BaseDocument>(
  collectionName: string,
  id: string,
  data: Partial<Omit<T, 'id' | 'createdAt'>>
): Promise<boolean> => {
  try {
    const docRef = doc(db, collectionName, id);
    await updateDoc(docRef, {
      ...data,
      updatedAt: Timestamp.now() // Use Firestore Timestamp
    });
    return true;
  } catch (error) {
    console.error("Error updating document:", error);
    throw error;
  }
};

// Delete a document
export const deleteDocument = async (
  collectionName: string,
  id: string
): Promise<boolean> => {
  try {
    await deleteDoc(doc(db, collectionName, id));
    return true;
  } catch (error) {
    console.error("Error deleting document:", error);
    throw error;
  }
}; 