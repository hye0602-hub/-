import { 
  AlarmClockCheck, 
  X, 
  Volume2, 
  Megaphone, 
  CheckSquare, 
  ChevronRight, 
  Smile,
  Loader2
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { Screen } from '../App';
import { BottomNav } from '../components/BottomNav';
import { createAlarm } from '../lib/alarms';
import { cn } from '../lib/utils';

interface AlarmEditProps {
  onNavigate: (screen: Screen) => void;
  onNext: (alarmData: { time: string, days: string[], label: string, volume: number, isStormAlarm: boolean }) => void;
}

export default function AlarmEdit({ onNavigate, onNext }: AlarmEditProps) {
  const [selectedHour, setSelectedHour] = useState(8);
  const [selectedMinute, setSelectedMinute] = useState(30);
  const [selectedDays, setSelectedDays] = useState<string[]>(['화', '수', '목', '금']);
  const [label, setLabel] = useState("기상 알람");
  const [volume, setVolume] = useState(85);
  const [isStormAlarm, setIsStormAlarm] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const hourScrollRef = useRef<HTMLDivElement>(null);
  const minuteScrollRef = useRef<HTMLDivElement>(null);

  const hours = Array.from({ length: 24 }, (_, i) => i);
  const minutes = Array.from({ length: 60 }, (_, i) => i);

  useEffect(() => {
    // Initial scroll sync
    if (hourScrollRef.current) hourScrollRef.current.scrollTop = selectedHour * 64;
    if (minuteScrollRef.current) minuteScrollRef.current.scrollTop = selectedMinute * 64;
  }, []);

  const dayOptions = ['일', '월', '화', '수', '목', '금', '토'];

  const handleDayToggle = (day: string) => {
    setSelectedDays(prev => 
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const handleNext = () => {
    setError(null);
    if (!label.trim()) {
      setError("알람 이름을 입력해주세요.");
      return;
    }
    if (selectedDays.length === 0) {
      setError("최소 하루 이상의 반복 요일을 선택해주세요.");
      return;
    }

    const timeStr = `${selectedHour.toString().padStart(2, '0')}:${selectedMinute.toString().padStart(2, '0')}`;
    onNext({ time: timeStr, days: selectedDays, label, volume, isStormAlarm });
  };

  return (
    <div className="min-h-screen pb-32">
      <header className="w-full top-0 sticky bg-background z-40">
        <div className="flex justify-between items-center px-6 py-4 w-full max-w-md mx-auto">
          <div className="flex items-center gap-2">
            <AlarmClockCheck className="text-primary w-7 h-7" />
            <h1 className="text-2xl font-black text-primary tracking-tighter">또 5분만?</h1>
          </div>
          <button 
            onClick={() => onNavigate('dashboard')}
            className="bouncy hover:scale-105 transition-transform text-on-surface-variant"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </header>

      <main className="max-w-md mx-auto px-6 space-y-8">
        <section className="mt-4 flex justify-between items-end">
          <div>
            <h2 className="font-headline font-bold text-3xl text-on-surface">알람 편집</h2>
            <p className="text-on-surface-variant mt-1">상쾌한 아침을 위한 완벽한 설정</p>
          </div>
        </section>

        <section className="relative py-6 flex justify-center items-center">
          <div className="glass-card rounded-xl p-6 w-full flex justify-center items-center shadow-[0_8px_32px_rgba(224,64,160,0.1)] relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-surface via-transparent to-surface pointer-events-none z-10 opacity-80 h-full"></div>
            
            <div className="flex items-center gap-6 z-0 relative">
              {/* Hours Picker */}
              <div 
                ref={hourScrollRef}
                className="h-48 w-24 overflow-y-auto snap-y snap-mandatory flex flex-col items-center py-16 relative z-20 custom-scrollbar pr-2"
                onScroll={(e) => {
                  const idx = Math.round(e.currentTarget.scrollTop / 64);
                  if (hours[idx] !== undefined) setSelectedHour(hours[idx]);
                }}
              >
                {hours.map(h => (
                  <div 
                    key={h} 
                    className="h-16 flex-shrink-0 snap-center flex items-center justify-center cursor-pointer w-full"
                    onClick={() => {
                      if (hourScrollRef.current) hourScrollRef.current.scrollTo({ top: h * 64, behavior: 'smooth' });
                    }}
                  >
                    <span className={selectedHour === h ? "text-5xl font-black text-on-surface transition-all scale-110" : "text-4xl font-bold text-on-surface/20 transition-all hover:text-on-surface/40"}>
                      {h.toString().padStart(2, '0')}
                    </span>
                  </div>
                ))}
              </div>

              <span className="text-primary font-black text-4xl mb-1 z-20">:</span>

              {/* Minutes Picker */}
              <div 
                ref={minuteScrollRef}
                className="h-48 w-24 overflow-y-auto snap-y snap-mandatory flex flex-col items-center py-16 relative z-20 custom-scrollbar pr-2"
                onScroll={(e) => {
                  const idx = Math.round(e.currentTarget.scrollTop / 64);
                  if (minutes[idx] !== undefined) setSelectedMinute(minutes[idx]);
                }}
              >
                {minutes.map(m => (
                  <div 
                    key={m} 
                    className="h-16 flex-shrink-0 snap-center flex items-center justify-center cursor-pointer w-full"
                    onClick={() => {
                      if (minuteScrollRef.current) minuteScrollRef.current.scrollTo({ top: m * 64, behavior: 'smooth' });
                    }}
                  >
                    <span className={selectedMinute === m ? "text-5xl font-black text-on-surface transition-all scale-110" : "text-4xl font-bold text-on-surface/20 transition-all hover:text-on-surface/40"}>
                      {m.toString().padStart(2, '0')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="absolute left-0 right-0 h-16 border-y-2 border-primary/20 pointer-events-none top-1/2 -translate-y-1/2 bg-primary/5"></div>
          </div>
        </section>

        <section className="space-y-4">
          <h3 className="font-bold text-lg px-2 text-on-surface">반복 요일</h3>
          <div className="flex justify-between items-center gap-2">
            {dayOptions.map(day => (
              <button 
                key={day}
                onClick={() => handleDayToggle(day)}
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all bouncy",
                  selectedDays.includes(day) 
                    ? "bg-primary text-on-primary shadow-[0_4px_12px_rgba(224,64,160,0.3)]" 
                    : "bg-surface-container-highest text-on-surface-variant"
                )}
              >
                {day}
              </button>
            ))}
          </div>
        </section>

        <section className="space-y-4">
           <h3 className="font-bold text-lg px-2 text-on-surface">알람 이름</h3>
           <input 
            type="text" 
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="알람 이름을 입력하세요"
            className="w-full bg-surface-container rounded-lg p-4 font-bold text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50"
           />
        </section>

        <section className="space-y-6">
          <div className="bg-surface-container rounded-lg p-6 space-y-6 shadow-sm">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <label className="font-bold text-on-surface flex items-center gap-2">
                  <Volume2 className="text-tertiary w-5 h-5" />
                  알람 볼륨
                </label>
                <span className="text-tertiary font-bold">{volume}%</span>
              </div>
              <div className="relative h-4 bg-tertiary-fixed rounded-full">
                <input 
                  type="range"
                  min="0"
                  max="100"
                  value={volume}
                  onChange={(e) => setVolume(parseInt(e.target.value))}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                />
                <div 
                  className="absolute left-0 top-0 bottom-0 bg-tertiary rounded-full pointer-events-none" 
                  style={{ width: `${volume}%` }}
                ></div>
                <div 
                  className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-6 h-6 bg-white border-4 border-tertiary rounded-full shadow-md pointer-events-none z-10"
                  style={{ left: `${volume}%` }}
                ></div>
              </div>
            </div>

            <div className="flex justify-between items-center bg-white/50 p-4 rounded-full border border-outline-variant/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-secondary-fixed flex items-center justify-center">
                  <Megaphone className="text-secondary w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-on-surface text-sm">폭풍 알람 (Extra Loud)</p>
                  <p className="text-xs text-on-surface-variant">잠귀가 어두운 분들을 위한 모드</p>
                </div>
              </div>
              <button 
                onClick={() => setIsStormAlarm(!isStormAlarm)}
                className={cn(
                  "w-14 h-8 rounded-full relative flex items-center px-1 transition-colors duration-300",
                  isStormAlarm ? "bg-primary" : "bg-surface-container-highest"
                )}
              >
                <div className={cn(
                  "w-6 h-6 bg-white rounded-full shadow-sm transition-transform duration-300",
                  isStormAlarm ? "translate-x-6" : "translate-x-0"
                )}></div>
              </button>
            </div>
          </div>
        </section>

        <section>
          <button 
            onClick={handleNext}
            className="w-full py-5 bg-gradient-to-r from-primary to-secondary text-white font-bold rounded-lg flex items-center justify-center gap-3 shadow-[0_8px_24px_rgba(224,64,160,0.3)] bouncy group"
          >
            <CheckSquare className="w-6 h-6" />
            미션 선택하기
            <ChevronRight className="w-6 h-6 transition-transform group-hover:translate-x-1" />
          </button>
        </section>



        {error && (
          <div className="fixed bottom-32 left-6 right-6 z-50 bg-error-container text-on-error-container p-4 rounded-xl font-bold shadow-lg animate-in slide-in-from-bottom flex items-center gap-3 border border-error/20">
            <div className="w-2 h-2 bg-error rounded-full animate-pulse" />
            {error}
          </div>
        )}
      </main>

      <BottomNav activeTab="alarms" onNavigate={onNavigate} />
    </div>
  );
}

