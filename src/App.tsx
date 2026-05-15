import { useState } from 'react';
import Dashboard from './screens/Dashboard';
import AlarmEdit from './screens/AlarmEdit';
import MissionSelect from './screens/MissionSelect';
import MissionExecute from './screens/MissionExecute';
import History from './screens/History';
import Settings from './screens/Settings';
import LoginScreen from './screens/LoginScreen';
import { AuthProvider, useAuth } from './lib/AuthContext';

export type Screen = 'dashboard' | 'alarm-edit' | 'mission-select' | 'mission-execute' | 'history' | 'settings';
export type MissionType = 'step' | 'math' | 'shake' | 'puzzle';

export interface PendingAlarm {
  time: string;
  days: string[];
  label: string;
  intensity?: 'low' | 'medium' | 'high';
  volume: number;
  isStormAlarm: boolean;
}

function AppContent() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('dashboard');
  const [selectedMission, setSelectedMission] = useState<MissionType>('step');
  const [pendingAlarm, setPendingAlarm] = useState<PendingAlarm | null>(null);
  const [intensity, setIntensity] = useState<'low' | 'medium' | 'high'>('medium');
  const { user, loading } = useAuth();

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

  return (
    <div className="bg-background text-on-background min-h-screen">
      {currentScreen === 'dashboard' && <Dashboard onNavigate={setCurrentScreen} />}
      {currentScreen === 'alarm-edit' && <AlarmEdit onNavigate={setCurrentScreen} onNext={handleNextFromAlarmEdit} />}
      {currentScreen === 'mission-select' && <MissionSelect onNavigate={setCurrentScreen} selectedMission={selectedMission} onSelectMission={setSelectedMission} pendingAlarm={pendingAlarm} onStartPreview={handleStartPreview} intensity={intensity} setIntensity={setIntensity} />}
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
