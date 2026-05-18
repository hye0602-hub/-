import { 
  AlarmClockCheck, 
  X, 
  Zap, 
  Footprints, 
  Calculator, 
  Smartphone,
  Sun,
  Loader2,
  Gamepad2
} from 'lucide-react';
import { useState } from 'react';
import { Screen, MissionType, PendingAlarm } from '../App';
import { BottomNav } from '../components/BottomNav';
import { createAlarm } from '../lib/alarms';
import { cn } from '../lib/utils';

interface MissionSelectProps {
  onNavigate: (screen: Screen) => void;
  selectedMission: MissionType;
  onSelectMission: (mission: MissionType) => void;
  pendingAlarm: PendingAlarm | null;
  onStartPreview: (mission: MissionType) => void;
  intensity: 'low' | 'medium' | 'high';
  setIntensity: (intensity: 'low' | 'medium' | 'high') => void;
}

export default function MissionSelect({ onNavigate, selectedMission, onSelectMission, pendingAlarm, onStartPreview, intensity, setIntensity }: MissionSelectProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    if (!pendingAlarm) {
      setError("알람 정보가 없습니다. 다시 설정해주세요.");
      onNavigate('alarm-edit');
      return;
    }
    
    setIsSaving(true);
    setError(null);
    try {
      await createAlarm(
        pendingAlarm.time, 
        pendingAlarm.days, 
        pendingAlarm.label, 
        selectedMission, 
        intensity,
        pendingAlarm.volume,
        pendingAlarm.isStormAlarm,
        pendingAlarm.date
      );
      onNavigate('dashboard');
    } catch (saveError) {
      console.error("Failed to save alarm:", saveError);
      setError("알람 저장 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setIsSaving(false);
    }
  };
  const getMissionPreview = (mission: MissionType, intensity: 'low' | 'medium' | 'high') => {
    switch(mission) {
      case 'step': 
        const steps = intensity === 'low' ? 20 : intensity === 'medium' ? 50 : 80;
        return { icon: Footprints, color: 'from-teal-200 to-teal-500', text: `${steps}걸음을 걸어보세요` };
      case 'math': 
        const questions = intensity === 'low' ? 3 : intensity === 'medium' ? 5 : 10;
        return { icon: Calculator, color: 'from-purple-200 to-purple-500', text: `사칙연산 ${questions}문제를 풀어보세요` };
      case 'shake': 
        const shakes = intensity === 'low' ? 30 : intensity === 'medium' ? 50 : 100;
        return { icon: Smartphone, color: 'from-blue-200 to-blue-500', text: `전화기를 ${shakes}회 흔들어주세요` };
      case 'puzzle': 
        const moles = intensity === 'low' ? 4 : intensity === 'medium' ? 9 : 16;
        return { icon: Gamepad2, color: 'from-orange-200 to-orange-500', text: `두더지 ${moles}마리를 잡아보세요` };
      default: return { icon: Sun, color: 'from-pink-200 to-pink-500', text: '잠을 깨우는 방법' };
    }
  };
  const preview = getMissionPreview(selectedMission, intensity);

  return (
    <div className="min-h-screen pb-24">
      <nav className="w-full top-0 sticky bg-background z-50">
        <div className="flex justify-between items-center px-6 py-4 w-full max-w-md mx-auto">
          <div className="flex items-center gap-2">
            <AlarmClockCheck className="text-primary w-7 h-7" />
            <span className="text-2xl font-black text-primary tracking-tighter">또 5분만?</span>
          </div>
          <button 
            onClick={() => onNavigate('alarm-edit')}
            className="hover:scale-105 transition-transform p-2 rounded-full bg-surface-container-high"
          >
            <X className="w-5 h-5 text-on-surface-variant" />
          </button>
        </div>
      </nav>

      <main className="max-w-md mx-auto px-6 pt-4">
        <header className="mb-8">
          <h1 className="text-3xl font-headline font-bold text-on-surface mb-2">기상 미션 선택</h1>
          <p className="text-on-surface-variant">가장 확실하게 잠을 깨워줄 미션을 골라보세요!</p>
        </header>

        <section className="mb-8 bg-surface-container rounded-lg p-5 shadow-[0_4px_16px_rgba(124,82,170,0.05)]">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="text-secondary w-5 h-5" />
            <h2 className="font-bold text-lg text-secondary">미션 강도 설정</h2>
          </div>
          <div className="flex gap-2 p-1 bg-surface-container-highest rounded-full">
            <button 
              onClick={() => setIntensity('low')}
              className={cn("flex-1 py-3 px-4 rounded-full text-sm font-bold transition-all duration-300", intensity === 'low' ? "bg-secondary text-on-secondary shadow-[0_4px_12px_rgba(124,82,170,0.3)]" : "bg-background text-on-surface-variant shadow-sm")}
            >
              Low
            </button>
            <button 
              onClick={() => setIntensity('medium')}
              className={cn("flex-1 py-3 px-4 rounded-full text-sm font-bold transition-all duration-300", intensity === 'medium' ? "bg-secondary text-on-secondary shadow-[0_4px_12px_rgba(124,82,170,0.3)]" : "bg-background text-on-surface-variant shadow-sm")}
            >
              Medium
            </button>
            <button 
              onClick={() => setIntensity('high')}
              className={cn("flex-1 py-3 px-4 rounded-full text-sm font-bold transition-all duration-300", intensity === 'high' ? "bg-secondary text-on-secondary shadow-[0_4px_12px_rgba(124,82,170,0.3)]" : "bg-background text-on-surface-variant shadow-sm")}
            >
              High
            </button>
          </div>
        </section>

        <div className="grid grid-cols-2 gap-4">
          <button 
            onClick={() => onSelectMission('step')}
            className={cn(
              "group flex flex-col items-center justify-center p-6 bg-white rounded-lg transition-all duration-300 ease-out text-center border-2",
              selectedMission === 'step' ? "border-tertiary shadow-[0_8px_20px_rgba(0,150,204,0.2)] bg-tertiary-container/20" : "border-transparent hover:border-tertiary shadow-[0_8px_20px_rgba(0,150,204,0.05)] hover:scale-105"
            )}
          >
            <div className="w-16 h-16 rounded-full bg-tertiary-fixed flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Footprints className="w-8 h-8 text-tertiary" />
            </div>
            <h3 className="font-bold text-on-surface">걷기 미션</h3>
            <p className="text-xs text-on-surface-variant mt-1">{intensity === 'low' ? 20 : intensity === 'medium' ? 50 : 80}걸음 이동하기</p>
          </button>

          <button 
            onClick={() => onSelectMission('math')}
            className={cn(
              "group flex flex-col items-center justify-center p-6 bg-white rounded-lg transition-all duration-300 ease-out text-center border-2",
              selectedMission === 'math' ? "border-secondary shadow-[0_8px_20px_rgba(124,82,170,0.2)] bg-secondary-container/20" : "border-transparent hover:border-secondary shadow-[0_8px_20px_rgba(124,82,170,0.05)] hover:scale-105"
            )}
          >
            <div className="w-16 h-16 rounded-full bg-secondary-fixed flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Calculator className="w-8 h-8 text-secondary" />
            </div>
            <h3 className="font-bold text-on-surface">수학 문제</h3>
            <p className="text-xs text-on-surface-variant mt-1">사칙연산 {intensity === 'low' ? 3 : intensity === 'medium' ? 5 : 10}문제</p>
          </button>

          <button 
            onClick={() => onSelectMission('shake')}
            className={cn(
              "group flex flex-col items-center justify-center p-6 bg-white rounded-lg transition-all duration-300 ease-out text-center border-2",
              selectedMission === 'shake' ? "border-primary shadow-[0_8px_20px_rgba(224,64,160,0.2)] bg-primary-container/20" : "border-transparent hover:border-primary shadow-[0_8px_20px_rgba(224,64,160,0.05)] hover:scale-105"
            )}
          >
            <div className="w-16 h-16 rounded-full bg-primary-fixed flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Smartphone className="w-8 h-8 text-primary" />
            </div>
            <h3 className="font-bold text-on-surface">흔들기</h3>
            <p className="text-xs text-on-surface-variant mt-1">전화기 {intensity === 'low' ? 30 : intensity === 'medium' ? 50 : 100}회 흔들기</p>
          </button>

          <button 
            onClick={() => onSelectMission('puzzle')}
            className={cn(
              "group flex flex-col items-center justify-center p-6 bg-white rounded-lg transition-all duration-300 ease-out text-center border-2",
              selectedMission === 'puzzle' ? "border-tertiary shadow-[0_8px_20px_rgba(0,150,204,0.2)] bg-tertiary-container/20" : "border-transparent hover:border-tertiary shadow-[0_8px_20px_rgba(0,150,204,0.05)] hover:scale-105"
            )}
          >
            <div className="w-16 h-16 rounded-full bg-tertiary-fixed flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Gamepad2 className="w-8 h-8 text-tertiary" />
            </div>
            <h3 className="font-bold text-on-surface">두더지 잡기</h3>
            <p className="text-xs text-on-surface-variant mt-1">두더지 {intensity === 'low' ? 4 : intensity === 'medium' ? 9 : 16}마리 잡기</p>
          </button>
        </div>

        <div className="mt-8 rounded-lg overflow-hidden relative group">
          <div className={cn("w-full h-40 bg-gradient-to-br flex items-center justify-center p-4", preview.color)}>
               <preview.icon className="w-24 h-24 text-white opacity-50" />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end p-4 justify-between">
            <span className="text-white font-bold text-sm">{preview.text}</span>
            <button 
              onClick={() => onStartPreview(selectedMission)}
              className="bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full backdrop-blur-sm hover:bg-white/40 transition-colors"
            >
              미리보기
            </button>
          </div>
        </div>

        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="w-full mt-8 py-4 px-6 bg-primary text-on-primary font-bold text-lg rounded-full shadow-[0_4px_16px_rgba(224,64,160,0.4)] hover:scale-[1.03] transition-all duration-300 active:scale-95 text-center flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isSaving ? <Loader2 className="w-6 h-6 animate-spin" /> : "이 미션으로 저장하기"}
        </button>

        {error && (
          <div className="mt-4 p-4 bg-error-container text-on-error-container rounded-xl text-sm font-bold animate-in fade-in slide-in-from-top-4">
            {error}
          </div>
        )}
      </main>

      <BottomNav activeTab="missions" onNavigate={onNavigate} />
    </div>
  );
}
