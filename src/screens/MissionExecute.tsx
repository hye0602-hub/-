import { 
  AlarmClockCheck, 
  Activity, 
  Sparkles, 
  CheckCircle2, 
  Clock,
  Loader2,
  Calculator,
  Smartphone,
  ChevronLeft,
  Play
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { Screen, MissionType } from '../App';
import { createMission } from '../lib/missions';
import { getActiveSession, endSleep, createCompletedSleepSession } from '../lib/sleep';
import { generateSleepFeedback } from '../services/gemini';
import { db, auth } from '../lib/firebase';
import { format } from 'date-fns';
import { cn } from '../lib/utils';
import { alarmAudio } from '../lib/audio';

interface MissionExecuteProps {
  onNavigate: (screen: Screen) => void;
  missionType: MissionType;
  intensity: 'low' | 'medium' | 'high';
  isPreview?: boolean;
  volume?: number;
  isStormAlarm?: boolean;
}

export default function MissionExecute({ 
  onNavigate, 
  missionType, 
  intensity, 
  isPreview = false,
  volume = 10,
  isStormAlarm = false
}: MissionExecuteProps) {
  const [progressValue, setProgressValue] = useState(0);
  const [targetValue, setTargetValue] = useState(50);
  const [isSaving, setIsSaving] = useState(false);
  const [mathAnswers, setMathAnswers] = useState<string[]>([]);
  const [mathProblems, setMathProblems] = useState<string[]>([]);
  const [mathSolutions, setMathSolutions] = useState<string[]>([]);
  const [molePosition, setMolePosition] = useState<number | null>(null);
  
  const [motionStarted, setMotionStarted] = useState(false);
  const [permissionError, setPermissionError] = useState('');
  const lastTimeRef = useRef(0);

  const generateMathProblems = (count: number, intensity: 'low' | 'medium' | 'high') => {
    const problems = [];
    const solutions = [];
    for (let i = 0; i < count; i++) {
        let a, b, op, res;
        if (intensity === 'low') {
            a = Math.floor(Math.random() * 20) + 1;
            b = Math.floor(Math.random() * 20) + 1;
            op = Math.random() > 0.5 ? '+' : '-';
            if (op === '+') res = a + b;
            else { res = Math.max(a, b); b = Math.min(a, b); a = res; res = a - b; }
        } else if (intensity === 'medium') {
            a = Math.floor(Math.random() * 50) + 10;
            b = Math.floor(Math.random() * 50) + 10;
            op = Math.random() > 0.33 ? '+' : Math.random() > 0.5 ? '-' : '×';
            if (op === '+') res = a + b;
            else if (op === '-') { res = Math.max(a, b); b = Math.min(a, b); a = res; res = a - b; }
            else { a = Math.floor(Math.random() * 12) + 1; b = Math.floor(Math.random() * 12) + 1; res = a * b; }
        } else {
            a = Math.floor(Math.random() * 100) + 20;
            b = Math.floor(Math.random() * 100) + 20;
            op = Math.random() > 0.25 ? '+' : Math.random() > 0.33 ? '-' : Math.random() > 0.5 ? '×' : '÷';
            if (op === '+') res = a + b;
            else if (op === '-') { res = Math.max(a, b); b = Math.min(a, b); a = res; res = a - b; }
            else if (op === '×') { a = Math.floor(Math.random() * 20) + 1; b = Math.floor(Math.random() * 20) + 1; res = a * b; }
            else { res = Math.floor(Math.random() * 10) + 1; b = Math.floor(Math.random() * 10) + 1; a = res * b; }
        }
        problems.push(`${a} ${op} ${b}`);
        solutions.push(res.toString());
    }
    return { problems, solutions };
  };

  useEffect(() => {
    // Start alarm sound
    alarmAudio.start(volume, isStormAlarm);
    
    return () => {
      // Stop alarm sound when component unmounts or mission finishes
      alarmAudio.stop();
    };
  }, [volume, isStormAlarm]);

  useEffect(() => {
    // intensityに基づいてtargetValueを設定
    let baseValue = 50;
    if (missionType === 'step') {
      baseValue = intensity === 'low' ? 20 : intensity === 'medium' ? 50 : 80;
    } else if (missionType === 'shake') {
      baseValue = intensity === 'low' ? 30 : intensity === 'medium' ? 50 : 100;
    } else if (missionType === 'math') {
      baseValue = intensity === 'low' ? 3 : intensity === 'medium' ? 5 : 10;
    } else if (missionType === 'puzzle') {
      baseValue = intensity === 'low' ? 4 : intensity === 'medium' ? 9 : 16;
    }
    setTargetValue(baseValue);
    
    if (missionType === 'math') {
        const { problems, solutions } = generateMathProblems(baseValue, intensity);
        setMathProblems(problems);
        setMathSolutions(solutions);
        setMathAnswers(new Array(baseValue).fill(''));
    } else if (missionType === 'puzzle') {
        const gameInterval = setInterval(() => {
            setMolePosition(prev => {
                let next;
                do {
                    next = Math.floor(Math.random() * 9);
                } while (next === prev); // Ensure not the same as previous
                return next;
            });
            // Mole disappears after random time
            const duration = 700 + Math.random() * (intensity === 'low' ? 400 : 200);
            setTimeout(() => setMolePosition(null), duration);
        }, 1200 - (intensity === 'low' ? 0 : 300));
        return () => clearInterval(gameInterval);
    }

    if (missionType === 'step' || missionType === 'shake') {
      setProgressValue(0);
      
      if (!motionStarted) return; // Wait until started

      const threshold = missionType === 'step' ? 12 : 18;
      const debounceDelay = missionType === 'step' ? 300 : 150;
      
      const handleMotion = (event: DeviceMotionEvent) => {
        if (!event.acceleration) return;
        const { x, y, z } = event.acceleration;
        if (x === null || y === null || z === null) return;
        
        const acceleration = Math.sqrt(x*x + y*y + z*z);
        const now = Date.now();
        
        if (acceleration > threshold && (now - lastTimeRef.current) > debounceDelay) {
          lastTimeRef.current = now;
          setProgressValue(prev => {
            const next = Math.min(prev + 1, baseValue);
            return next;
          });
        }
      };

      window.addEventListener('devicemotion', handleMotion);
      return () => {
        window.removeEventListener('devicemotion', handleMotion);
      };
    } else if (missionType === 'math' || missionType === 'puzzle') {
      setProgressValue(0);
    }
  }, [missionType, intensity, motionStarted]);

  const startMotionSensor = async () => {
    if (typeof (DeviceMotionEvent as any).requestPermission === 'function') {
      try {
        const permissionState = await (DeviceMotionEvent as any).requestPermission();
        if (permissionState === 'granted') {
          setMotionStarted(true);
        } else {
          setPermissionError("센서 권한이 거부되었습니다.");
        }
      } catch (e) {
        console.error(e);
        setPermissionError("센서 권한을 요청할 수 없습니다.");
      }
    } else {
      // Non-iOS devices
      setMotionStarted(true);
    }
  };

  useEffect(() => {
    if (missionType === 'math') {
      let correctCount = 0;
      mathAnswers.forEach((ans, idx) => {
        if (ans === mathSolutions[idx]) correctCount++;
      });
      setProgressValue(correctCount);
    }
  }, [mathAnswers, missionType]);

  const handleComplete = async () => {
    if (isPreview) {
      onNavigate('mission-select');
      return;
    }
    setIsSaving(true);
    try {
      const now = new Date();
      const wakeupTime = format(now, 'HH:mm');
      
      // Try to get active sleep session for accurate data
      const active = await getActiveSession();
      let sleepAtStr = format(new Date(now.getTime() - 7 * 60 * 60 * 1000), 'HH:mm');
      
      if (active) {
        sleepAtStr = format(active.startTime.toDate(), 'HH:mm');
        
        // Also end the sleep session since the user woke up via mission
        const startMillis = active.startTime.toMillis();
        const endMillis = now.getTime();
        const durationHours = (endMillis - startMillis) / (1000 * 60 * 60);
        const score = Math.min(100, Math.round((durationHours / 8) * 100));
        
        const feedback = await generateSleepFeedback(durationHours, score);
        await endSleep(active.id!, feedback);
        
        // Use the calculated values for mission history
        await createMission(sleepAtStr, wakeupTime, missionType, intensity, durationHours, score, feedback);
      } else {
        // Assume 7 hours of sleep if there is no active session
        const durationHours = 7;
        const score = Math.min(100, Math.round((durationHours / 8) * 100));
        
        const feedback = await generateSleepFeedback(durationHours, score);
        
        // Formulate exactly 7 hours prior 
        const startTime = new Date(now.getTime() - 7 * 60 * 60 * 1000);
        await createCompletedSleepSession(startTime, now, feedback);
        
        await createMission(sleepAtStr, wakeupTime, missionType, intensity, durationHours, score, feedback);
      }
      onNavigate('dashboard');
    } catch (error) {
      console.error("Failed to save mission:", error);
      alert("기록을 저장하는 중 오류가 발생했습니다.");
    } finally {
      setIsSaving(false);
    }
  };

  const progress = (progressValue / targetValue) * 100;
  const dashOffset = 552.92 - (552.92 * progress) / 100;

  const renderMissionContent = () => {
    if (missionType === 'math') {
      return (
        <div className="w-full flex flex-col gap-4 mb-8">
          {mathProblems.map((problem, idx) => (
            <div key={idx} className="bg-white p-4 rounded-xl flex items-center justify-between shadow-sm">
              <span className="text-xl font-bold font-mono">{problem} = </span>
              <input 
                type="number"
                value={mathAnswers[idx]}
                onChange={(e) => {
                  const newAnswers = [...mathAnswers];
                  newAnswers[idx] = e.target.value;
                  setMathAnswers(newAnswers);
                }}
                className={`w-20 text-center font-bold text-lg p-2 rounded-lg border-2 ${
                  mathAnswers[idx] === mathSolutions[idx] ? 'border-primary bg-primary/10 text-primary' : 'border-outline-variant bg-surface-container'
                } focus:outline-none focus:border-primary`}
              />
            </div>
          ))}
        </div>
      );
    } else if(missionType === 'puzzle') {
       return (
        <div className="flex flex-col items-center w-full">
            <div className="text-xl font-bold mb-4 text-on-surface">
                점수: {progressValue} / {targetValue}
            </div>
            <div className="grid grid-cols-3 gap-3 mb-8">
                {Array.from({length: 9}).map((_, idx) => (
                    <button
                        key={idx}
                        disabled={idx !== molePosition}
                        onClick={() => {
                            if (idx === molePosition) {
                                setProgressValue(prev => Math.min(prev + 1, targetValue));
                                setMolePosition(null);
                            }
                        }}
                        className={`w-24 h-24 rounded-full transition-all flex items-center justify-center shadow-inner ${
                            idx === molePosition ? 'bg-primary scale-105' : 'bg-surface-container-highest'
                        }`}
                    >
                        {idx === molePosition ? <span className="text-5xl">🐹</span> : <div className="w-12 h-12 rounded-full bg-surface-container-dark/50" />}
                    </button>
                ))}
            </div>
        </div>
       )
    }
    
    if ((missionType === 'step' || missionType === 'shake') && !motionStarted) {
      return (
        <div className="w-full flex items-center justify-center py-12">
          <button 
            onClick={startMotionSensor}
            className="bg-primary text-on-primary py-4 px-8 rounded-full font-bold shadow-lg shadow-primary/30 flex items-center gap-2 hover:scale-105 transition-all w-full text-center justify-center max-w-sm"
          >
            <Play className="w-6 h-6" />
            <span>임무 시작하기</span>
          </button>
          {permissionError && (
            <p className="absolute text-error font-medium mt-16 text-center w-full">
              {permissionError}
            </p>
          )}
        </div>
      );
    }

    // Circular progress for other missions
    return (
      <div className="w-full grid grid-cols-2 gap-4 mb-8">
        <div className="col-span-2 glass-card rounded-xl p-8 flex flex-col items-center justify-center shadow-[0_8px_32px_rgba(224,64,160,0.15)] relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/10 rounded-full blur-2xl"></div>
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-tertiary/10 rounded-full blur-2xl"></div>
          
          <div className="relative w-48 h-48 flex items-center justify-center">
            <svg className="absolute w-full h-full transform -rotate-90">
              <circle 
                className="text-surface-container-highest" 
                cx="96" cy="96" fill="transparent" r="88" stroke="currentColor" strokeWidth="12"
              />
              <circle 
                className="text-primary transition-all duration-700 ease-out" 
                cx="96" cy="96" fill="transparent" r="88" stroke="currentColor" 
                strokeDasharray="552.92" strokeDashoffset={dashOffset} strokeWidth="12"
              />
            </svg>
            <div className="text-center absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-5xl font-black text-primary block">{progressValue}</span>
                  <span className="text-on-surface-variant font-bold text-lg">/ {targetValue} {missionType === 'step' ? 'steps' : 'shakes'}</span>
            </div>
          </div>
        </div>

        <div className="glass-card rounded-xl p-6 flex flex-col items-center justify-center text-center shadow-[0_4px_16px_rgba(124,82,170,0.1)]">
          {missionType === 'shake' ? <Smartphone className="text-tertiary w-10 h-10 mb-2" /> : <Activity className="text-tertiary w-10 h-10 mb-2" />}
          <p className="text-sm font-bold text-on-surface-variant">정확한 측정중</p>
        </div>

        <div className="glass-card rounded-xl p-6 flex flex-col items-center justify-center text-center shadow-[0_4px_16px_rgba(0,150,204,0.1)]">
          <Sparkles className="text-secondary w-10 h-10 mb-2" />
          <p className="text-sm font-bold text-on-surface-variant">거의 다 왔어요!</p>
        </div>
      </div>
    );
  };

  const getMissionTitle = () => {
    switch(missionType) {
      case 'math': return '수학 문제 미션';
      case 'shake': return '핸드폰 흔들기 미션';
      case 'puzzle': return '두더지잡기';
      default: return '걷기 미션';
    }
  };

  const getMissionSubtitle = () => {
    switch(missionType) {
      case 'math': return '(사칙연산 풀기)';
      case 'shake': return '(흔들기 횟수 채우기)';
      case 'puzzle': return '(두더지 잡기)';
      default: return '(걸음 수 채우기)';
    }
  };

  const getEncouragementText = () => {
    if (progressValue >= targetValue) return "잠이 다 깼어요! ✨";
    switch(missionType) {
      case 'math': return "머리를 써야 잠이 깨요!";
      case 'shake': return "열심히 흔들어주세요!";
      case 'puzzle': return "두더지를 잡아보세요!";
      default: return "걸어야 잠이 깨요!";
    }
  };

  const getProgressLabel = () => {
    if (progressValue >= targetValue) return "미션 완료 & 해제";
    switch(missionType) {
      case 'math': return `해제하기 (${targetValue - progressValue}문제 남음)`;
      case 'shake': return `해제하기 (${targetValue - progressValue}번 더!)`;
      case 'puzzle': return `해제하기 (두더지를 잡아주세요!)`;
      default: return `해제하기 (${targetValue - progressValue}걸음 더!)`;
    }
  };

  return (
    <div className={cn(
      "min-h-screen flex flex-col overflow-hidden animate-pulse-vibrant",
      isStormAlarm && "animate-shake"
    )}>
      <header className="w-full top-0 sticky bg-transparent text-primary font-headline font-bold text-lg flex justify-between items-center px-6 py-4 max-w-md mx-auto z-10">
        <div className="flex items-center gap-2">
          {isPreview && (
            <button onClick={() => onNavigate('mission-select')} className="p-2 -ml-2 rounded-full hover:bg-primary/10">
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}
          <AlarmClockCheck className="text-2xl w-7 h-7" />
          <span className="text-2xl font-black text-primary tracking-tighter">또 5분만?</span>
        </div>
        <div className="bg-primary/10 px-3 py-1 rounded-full text-sm font-bold text-primary">
          AM 07:30
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-6 relative max-w-md mx-auto w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-on-background mb-2">{getMissionTitle()}</h1>
        </div>

        {renderMissionContent()}

        <div className="text-center mb-12">
          <h2 className="text-2xl font-black text-primary-fixed-variant mb-2">
            {getEncouragementText()}
          </h2>
          {missionType === 'step' && <p className="text-on-surface-variant font-medium">제자리 걸음도 좋아요. 계속 움직이세요!</p>}
          {missionType === 'math' && <p className="text-on-surface-variant font-medium">정답을 모두 맞추면 알람이 해제됩니다.</p>}
        </div>

        <div className="w-full flex flex-col gap-4 z-10 relative">
          <button 
            disabled={progressValue < targetValue || isSaving}
            onClick={handleComplete}
            className={`w-full py-5 rounded-full font-black text-xl shadow-inner flex items-center justify-center gap-3 transition-all bouncy ${
              progressValue >= targetValue 
              ? "bg-primary text-on-primary shadow-[0_8px_24px_rgba(224,64,160,0.3)]" 
              : "bg-surface-container-highest text-outline grayscale cursor-not-allowed"
            }`}
          >
            {isSaving ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : progressValue >= targetValue ? (
              <CheckCircle2 className="w-6 h-6" />
            ) : (
              <Clock className="w-6 h-6" />
            )}
            {isSaving ? "저장 중..." : progressValue >= targetValue ? "☀️ 기상하기" : getProgressLabel()}
          </button>
        </div>
      </main>

      <div className="fixed top-1/4 left-4 opacity-20 pointer-events-none">
        <div className="w-16 h-16 rounded-full border-[6px] border-primary" style={{transform: "scaleY(1.5) rotate(15deg)"}}></div>
      </div>
      <div className="fixed bottom-1/4 right-4 opacity-20 pointer-events-none">
        <Sparkles className="w-16 h-16 text-tertiary" />
      </div>
    </div>
  );
}
