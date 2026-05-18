import { 
  collection, 
  addDoc, 
  updateDoc, 
  doc, 
  query, 
  where, 
  orderBy, 
  limit, 
  getDocs, 
  Timestamp, 
  serverTimestamp 
} from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from './firebase';

export interface SleepSession {
  id?: string;
  userId: string;
  startTime: Timestamp;
  endTime?: Timestamp | null;
  durationHours?: number | null;
  score?: number | null;
  aiFeedback?: string | null;
  createdAt: Timestamp;
}

const COLLECTION_NAME = 'sleep_sessions';

export async function startSleep(): Promise<string> {
  if (!auth.currentUser) throw new Error("Authentication required");
  
  try {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      userId: auth.currentUser.uid,
      startTime: serverTimestamp(),
      createdAt: serverTimestamp(),
      endTime: null,
      durationHours: null,
      score: null,
      aiFeedback: null
    });
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, COLLECTION_NAME);
    return "";
  }
}

export async function createCompletedSleepSession(startTime: Date, endTime: Date, aiFeedback: string): Promise<string> {
  if (!auth.currentUser) throw new Error("Authentication required");
  
  try {
    const durationHours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
    const score = Math.min(100, Math.round((durationHours / 8) * 100));
    
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      userId: auth.currentUser.uid,
      startTime: Timestamp.fromDate(startTime),
      endTime: Timestamp.fromDate(endTime),
      createdAt: serverTimestamp(),
      durationHours,
      score,
      aiFeedback
    });
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, COLLECTION_NAME);
    return "";
  }
}

export async function endSleep(sessionId: string, aiFeedback: string): Promise<void> {
  if (!auth.currentUser) throw new Error("Authentication required");
  
  try {
    const sessionDoc = doc(db, COLLECTION_NAME, sessionId);
    const endTime = Timestamp.now();
    
    // We need to get the startTime to calculate duration
    const q = query(collection(db, COLLECTION_NAME), where("__name__", "==", sessionId));
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) throw new Error("Session not found");
    
    const data = querySnapshot.docs[0].data() as SleepSession;
    const startMillis = data.startTime.toMillis();
    const endMillis = endTime.toMillis();
    const durationHours = (endMillis - startMillis) / (1000 * 60 * 60);
    
    const score = Math.min(100, Math.round((durationHours / 8) * 100));
    
    await updateDoc(sessionDoc, {
      endTime,
      durationHours,
      score,
      aiFeedback
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${COLLECTION_NAME}/${sessionId}`);
  }
}

export async function getActiveSession(): Promise<SleepSession | null> {
  if (!auth.currentUser) return null;
  
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where("userId", "==", auth.currentUser.uid),
      where("endTime", "==", null),
      orderBy("startTime", "desc"),
      limit(1)
    );
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) return null;
    
    return { id: querySnapshot.docs[0].id, ...querySnapshot.docs[0].data() } as SleepSession;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, COLLECTION_NAME);
    return null;
  }
}

export async function getRecentSleepSessions(limitCount: number = 7): Promise<SleepSession[]> {
  if (!auth.currentUser) return [];
  
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where("userId", "==", auth.currentUser.uid),
      where("endTime", "!=", null),
      orderBy("endTime", "desc"),
      limit(limitCount)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SleepSession)).reverse();
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, COLLECTION_NAME);
    return [];
  }
}
