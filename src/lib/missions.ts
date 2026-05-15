import { collection, doc, setDoc, getDocs, deleteDoc, query, where, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType, auth } from './firebase';

export interface MissionData {
  userId: string;
  createdAt: any;
  sleepAt: string;
  wakeupAt: string;
  missionType?: string;
  intensity?: string;
  durationHours?: number;
  score?: number;
  aiFeedback?: string;
}

export async function createMission(
  sleepAt: string, 
  wakeupAt: string, 
  missionType?: string, 
  intensity?: string,
  durationHours?: number,
  score?: number,
  aiFeedback?: string
) {
  if (!auth.currentUser) throw new Error("Not authenticated");
  
  const missionRef = doc(collection(db, 'missions'));
  
  try {
    const data: MissionData = {
      userId: auth.currentUser.uid,
      createdAt: serverTimestamp(),
      sleepAt,
      wakeupAt,
      missionType: missionType || 'manual',
      intensity: intensity || 'none',
      durationHours: durationHours || 0,
      score: score || 0,
      aiFeedback: aiFeedback || ''
    };
    
    await setDoc(missionRef, data);
    return missionRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, 'missions');
  }
}

export async function getUserMissions() {
  if (!auth.currentUser) throw new Error("Not authenticated");
  
  try {
    const q = query(
      collection(db, 'missions'), 
      where('userId', '==', auth.currentUser.uid)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'missions');
  }
}

export async function deleteMission(missionId: string) {
  if (!auth.currentUser) throw new Error("Not authenticated");
  
  try {
    const missionRef = doc(db, 'missions', missionId);
    await deleteDoc(missionRef);
    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `missions/${missionId}`);
  }
}
