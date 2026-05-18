import { collection, doc, setDoc, getDocs, deleteDoc, updateDoc, query, where, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType, auth } from './firebase';

export interface AlarmData {
  id?: string;
  userId: string;
  time: string;
  label?: string;
  days: string[];
  date?: string;
  isEnabled: boolean;
  missionType: string;
  intensity: 'low' | 'medium' | 'high';
  volume: number;
  isStormAlarm: boolean;
  createdAt: any;
}

export async function createAlarm(
  time: string, 
  days: string[], 
  label: string | undefined, 
  missionType: string, 
  intensity: 'low' | 'medium' | 'high',
  volume: number = 10,
  isStormAlarm: boolean = false,
  date?: string
) {
  if (!auth.currentUser) throw new Error("Not authenticated");
  
  const alarmRef = doc(collection(db, 'alarms'));
  
  try {
    const data = {
      userId: auth.currentUser.uid,
      time,
      days,
      date: date || null,
      label: label || "",
      isEnabled: true,
      missionType,
      intensity,
      volume,
      isStormAlarm,
      createdAt: serverTimestamp(),
    };
    
    await setDoc(alarmRef, data);
    return alarmRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, 'alarms');
  }
}

export async function getAlarms() {
  if (!auth.currentUser) throw new Error("Not authenticated");
  
  try {
    const q = query(
      collection(db, 'alarms'), 
      where('userId', '==', auth.currentUser.uid)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as AlarmData[];
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'alarms');
  }
}

export async function toggleAlarm(alarmId: string, isEnabled: boolean) {
  if (!auth.currentUser) throw new Error("Not authenticated");
  
  try {
    const alarmRef = doc(db, 'alarms', alarmId);
    await updateDoc(alarmRef, { isEnabled });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `alarms/${alarmId}`);
  }
}

export async function updateAlarm(
  alarmId: string,
  time: string, 
  days: string[], 
  label: string | undefined, 
  missionType: string, 
  intensity: 'low' | 'medium' | 'high',
  volume: number = 10,
  isStormAlarm: boolean = false,
  date?: string
) {
  if (!auth.currentUser) throw new Error("Not authenticated");
  
  try {
    const alarmRef = doc(db, 'alarms', alarmId);
    const data = {
      time,
      days,
      date: date || null,
      label: label || "",
      missionType,
      intensity,
      volume,
      isStormAlarm
    };
    await updateDoc(alarmRef, data);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `alarms/${alarmId}`);
  }
}

export async function deleteAlarm(alarmId: string) {
  if (!auth.currentUser) throw new Error("Not authenticated");
  
  try {
    const alarmRef = doc(db, 'alarms', alarmId);
    await deleteDoc(alarmRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `alarms/${alarmId}`);
  }
}
