import { useState, useEffect, useRef } from 'react';
import Dashboard from './screens/Dashboard';
import AlarmEdit from './screens/AlarmEdit';
import MissionSelect from './screens/MissionSelect';
import MissionExecute from './screens/MissionExecute';
import History from './screens/History';
import Settings from './screens/Settings';
import LoginScreen from './screens/LoginScreen';
import { AuthProvider, useAuth } from './lib/AuthContext';
import { db } from './lib/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { AlarmData } from './lib/alarms';

export type Screen = 'dashboard' | 'alarm-edit' | 'mission-select' | 'mission-execute' | 'history' | 'settings';
export type MissionType = 'step' | 'math' | 'shake' | 'puzzle';

export interface PendingAlarm {
  time: string;
  days: string[];
  date?: string;
  label: string;
  intensity?: 'low' | 'medium' | 'high';
  volume: number;
  isStormAlarm: boolean;
}

function AppContent() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('dashboard');
  const [selectedMission, setSelectedMission] = useState<MissionType>('step');
  const [pendingAlarm, setPendingAlarm] = useState<PendingAlarm | null>(null);
  const [editingAlarm, setEditingAlarm] = useState<AlarmData | null>(null);
  const [intensity, setIntensity] = useState<'low' | 'medium' | 'high'>('medium');
  const { user, loading } = useAuth();
  
  const [alarms, setAlarms] = useState<AlarmData[]>([]);
  const triggeredAlarmsRef = useRef<Record<string, number>>({});

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'alarms'), where('userId', '==', user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedAlarms = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as AlarmData[];
      setAlarms(fetchedAlarms);
    });
    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    if (!user || alarms.length === 0) return;

    const interval = setInterval(() => {
      const now = new Date();
      const currentHours = now.getHours().toString().padStart(2, '0');
      const currentMinutes = now.getMinutes().toString().padStart(2, '0');
      const timeStr = `${currentHours}:${currentMinutes}`;
      const dayIndex = now.getDay();
      const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
      const currentDay = dayNames[dayIndex];
      const dateStr = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}`;

      for (const alarm of alarms) {
        if (!alarm.isEnabled) continue;

        // check if this alarm just triggered recently (within 2 minutes)
        const lastTriggered = triggeredAlarmsRef.current[alarm.id!];
        if (lastTriggered && now.getTime() - lastTriggered < 2 * 60 * 1000) {
          continue;
        }

        const isTimeMatch = alarm.time === timeStr;
        let isDayMatch = false;

        if (alarm.date) {
            isDayMatch = alarm.date === dateStr;
        } else if (alarm.days && alarm.days.length > 0) {
            isDayMatch = alarm.days.includes(currentDay);
        }

        if (isTimeMatch && isDayMatch && currentScreen !== 'mission-execute') {
          triggeredAlarmsRef.current[alarm.id!] = now.getTime();
          
          setSelectedMission(alarm.missionType as MissionType);
          setIntensity(alarm.intensity);
          setPendingAlarm({
            time: alarm.time,
            days: alarm.days,
            date: alarm.date,
            label: alarm.label || "기상 알람",
            volume: alarm.volume,
            isStormAlarm: alarm.isStormAlarm,
          });
          setCurrentScreen('mission-execute');
          break; // Trigger only one alarm at a time
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [alarms, user, currentScreen]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse-vibrant w-16 h-16 rounded-full"></div>
      </div>
    );
  }

  if (!user) {
    return <LoginScreen />;
  }

  const handleNextFromAlarmEdit = (alarm: PendingAlarm) => {
    setPendingAlarm(alarm);
    setCurrentScreen('mission-select');
  };

  const handleStartPreview = (mission: MissionType) => {
    setSelectedMission(mission);
    setCurrentScreen('mission-execute');
    // We keep pendingAlarm if it exists for preview settings, but MissionExecute needs to know
  };

  const handleEditAlarm = (alarm: AlarmData) => {
    setEditingAlarm(alarm);
    setCurrentScreen('alarm-edit');
  };

  const handleNavigate = (screen: Screen) => {
    if (screen === 'alarm-edit') {
      setEditingAlarm(null); // Clear editing state when normally navigating to add new
    }
    setCurrentScreen(screen);
  };

  return (
    <div className="bg-background text-on-background min-h-screen">
      {currentScreen === 'dashboard' && <Dashboard onNavigate={handleNavigate} onEditAlarm={handleEditAlarm} />}
      {currentScreen === 'alarm-edit' && <AlarmEdit onNavigate={handleNavigate} onNext={handleNextFromAlarmEdit} editingAlarm={editingAlarm} />}
      {currentScreen === 'mission-select' && <MissionSelect onNavigate={handleNavigate} selectedMission={selectedMission} onSelectMission={setSelectedMission} pendingAlarm={pendingAlarm} onStartPreview={handleStartPreview} intensity={intensity} setIntensity={setIntensity} editingAlarmId={editingAlarm?.id} />}
      {currentScreen === 'mission-execute' && (
        <MissionExecute 
          onNavigate={setCurrentScreen} 
          missionType={selectedMission} 
          intensity={intensity} 
          isPreview={pendingAlarm === null || pendingAlarm.time === ""} 
          volume={pendingAlarm?.volume} 
          isStormAlarm={pendingAlarm?.isStormAlarm}
        />
      )}
      {currentScreen === 'history' && <History onNavigate={setCurrentScreen} />}
      {currentScreen === 'settings' && <Settings onNavigate={setCurrentScreen} />}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
