'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  type ReactNode,
} from 'react';
import {
  collection,
  onSnapshot,
  addDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  serverTimestamp,
  updateDoc,
  type CollectionReference,
} from 'firebase/firestore';
import { useFirestore, useUser } from '@/firebase';
import type { NeedItem } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

type NeedsContextType = {
  needs: NeedItem[];
  loading: boolean;
  addNeed: (item: Omit<NeedItem, 'id' | 'createdAt' | 'addedBy' | 'addedByName'>) => Promise<void>;
  updateNeed: (id: string, item: Partial<Omit<NeedItem, 'id' | 'createdAt' | 'addedBy'>>) => Promise<void>;
  deleteNeed: (id: string) => void;
};

const NeedsContext = createContext<NeedsContextType | undefined>(undefined);

export function NeedsProvider({ children }: { children: ReactNode }) {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const [needs, setNeeds] = useState<NeedItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setNeeds([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const needsCollectionPath = 'need_items';
    const needsCollection = collection(db, needsCollectionPath) as CollectionReference<NeedItem>;
    
    const q = query(needsCollection, orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const needsData = querySnapshot.docs.map((doc) => ({
            ...doc.data(),
            id: doc.id,
        }));
        setNeeds(needsData);
        setLoading(false);
      },
      (error) => {
        const permissionError = new FirestorePermissionError({
          path: needsCollectionPath,
          operation: 'list',
        });
        errorEmitter.emit('permission-error', permissionError);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user, db]);

  const addNeed = useCallback(async (item: Omit<NeedItem, 'id' | 'createdAt' | 'addedBy' | 'addedByName'>) => {
    if (!user) {
        toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in to add an item.' });
        return;
    }
    
    const needsCollection = collection(db, 'need_items');
    const newItem = {
      ...item,
      createdAt: serverTimestamp(),
      addedBy: user.uid,
      addedByName: user.displayName || 'Anonymous',
    };

    return addDoc(needsCollection, newItem).catch(error => {
        const permissionError = new FirestorePermissionError({
          path: needsCollection.path,
          operation: 'create',
          requestResourceData: newItem,
        });
        errorEmitter.emit('permission-error', permissionError);
        throw error;
    }).then(() => {
        toast({ title: 'Success', description: 'Item added to needs list.' });
    });
  }, [user, db, toast]);

  const updateNeed = useCallback(async (id: string, item: Partial<Omit<NeedItem, 'id' | 'createdAt' | 'addedBy'>>) => {
    if (!user) {
      toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in to update an item.' });
      return;
    }
    const itemRef = doc(db, 'need_items', id);
    const updatedData = {
      ...item,
      updatedAt: serverTimestamp(),
    };

    return updateDoc(itemRef, updatedData).catch(error => {
      const permissionError = new FirestorePermissionError({
        path: itemRef.path,
        operation: 'update',
        requestResourceData: updatedData,
      });
      errorEmitter.emit('permission-error', permissionError);
      throw error;
    }).then(() => {
      toast({ title: 'Success', description: 'Need item updated.' });
    });
  }, [user, db, toast]);


  const deleteNeed = useCallback((id: string) => {
    if (!user) {
      toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in to remove an item.' });
      return;
    }
    const itemRef = doc(db, 'need_items', id);
  
    deleteDoc(itemRef)
      .then(() => {
        toast({ title: 'Success', description: 'Item removed from needs list.' });
      })
      .catch((error) => {
        const permissionError = new FirestorePermissionError({
          path: itemRef.path,
          operation: 'delete',
        });
        errorEmitter.emit('permission-error', permissionError);
    });
  }, [user, db, toast]);

  const value = useMemo(() => ({
    needs,
    loading,
    addNeed,
    updateNeed,
    deleteNeed,
  }), [needs, loading, addNeed, updateNeed, deleteNeed]);

  return (
    <NeedsContext.Provider value={value}>
      {children}
    </NeedsContext.Provider>
  );
}

export const useNeeds = () => {
  const context = useContext(NeedsContext);
  if (context === undefined) {
    throw new Error('useNeeds must be used within a NeedsProvider');
  }
  return context;
};
