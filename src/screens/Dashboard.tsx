import { 
  AlarmClockCheck, 
  Bell, 
  Moon, 
  PlusCircle, 
  Sun, 
  Trophy, 
  ChevronRight,
  LogOut,
  Trash2,
  Loader2,
  BellOff,
  Sparkles,
  X,
  Copy,
  Check
} from 'lucide-react';
import { motion } from 'motion/react';
import { useState, useEffect, useCallback } from 'react';
import { Screen } from '../App';
import { BottomNav } from '../components/BottomNav';
import { useAuth } from '../lib/AuthContext';
import { getAlarms, deleteAlarm, toggleAlarm, createAlarm, AlarmData } from '../lib/alarms';
import { createMission } from '../lib/missions';
import { 
  startSleep, 
  endSleep, 
  getActiveSession, 
  getRecentSleepSessions, 
  SleepSession 
} from '../lib/sleep';
import { generateSleepFeedback } from '../services/gemini';
import { cn } from '../lib/utils';
import { format } from 'date-fns';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';

interface DashboardProps {
  onNavigate: (screen: Screen) => void;
}

export default function Dashboard({ onNavigate }: DashboardProps) {
  const { signOut, user } = useAuth();
  const [alarms, setAlarms] = useState<AlarmData[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSession, setActiveSession] = useState<SleepSession | null>(null);
  const [recentSessions, setRecentSessions] = useState<SleepSession[]>([]);
  const [isProcessingSleep, setIsProcessingSleep] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleCopyAndSave = useCallback(async (session: SleepSession) => {
    if (!session.aiFeedback) return;
    
    try {
      // Copy to clipboard
      await navigator.clipboard.writeText(session.aiFeedback);
      setCopied(true);

      // Save to History (Mission) as a saved analysis record
      const sleepAt = format(session.startTime.toDate(), 'HH:mm');
      const wakeupAt = format(session.endTime?.toDate() || new Date(), 'HH:mm');
      
      await createMission(
        sleepAt, 
        wakeupAt, 
        'analysis_save', 
        'none', 
        session.durationHours, 
        session.score, 
        session.aiFeedback
      );
      
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Copy and save error:", err);
    }
  }, []);

  useEffect(() => {
    async function loadData() {
      if (!user) return;
      try {
        setLoading(true);
        const [alarmData, active, recent] = await Promise.all([
          getAlarms(),
          getActiveSession(),
          getRecentSleepSessions(7)
        ]);
        if (alarmData) setAlarms(alarmData);
        setActiveSession(active);
        setRecentSessions(recent);
      } catch (error) {
        console.error("Failed to load dashboard data:", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [user]);

  const handleStartSleep = async () => {
    setIsProcessingSleep(true);
    setError(null);
    try {
      await startSleep();
      const active = await getActiveSession();
      setActiveSession(active);
    } catch (err) {
      console.error("Start sleep error:", err);
      setError("수면 시작에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setIsProcessingSleep(false);
    }
  };

  const handleEndSleep = async () => {
    if (!activeSession?.id) return;
    setIsProcessingSleep(true);
    setError(null);
    try {
      // Calculate data for AI feedback
      const now = new Date();
      const startMillis = activeSession.startTime.toMillis();
      const endMillis = now.getTime();
      const durationHours = (endMillis - startMillis) / (1000 * 60 * 60);
      const score = Math.min(100, Math.round((durationHours / 8) * 100));
      
      const feedback = await generateSleepFeedback(durationHours, score);
      await endSleep(activeSession.id, feedback);

      // Save to History as a manual wakeup
      const sleepAt = format(activeSession.startTime.toDate(), 'HH:mm');
      const wakeupAt = format(now, 'HH:mm');
      await createMission(sleepAt, wakeupAt, 'manual', 'none', durationHours, score, feedback);
      
      // Refresh data
      const [active, recent] = await Promise.all([
        getActiveSession(),
        getRecentSleepSessions(7)
      ]);
      setActiveSession(active);
      setRecentSessions(recent);
    } catch (err) {
      console.error("End sleep error:", err);
      setError("수면 종료 처리에 실패했습니다. 네트워크를 확인해주세요.");
    } finally {
      setIsProcessingSleep(false);
    }
  };

  const handleDeleteAlarm = async (id: string) => {
    try {
      await deleteAlarm(id);
      setAlarms(prev => prev.filter(a => a.id !== id));
    } catch (error) {
      console.error("Failed to delete alarm:", error);
    }
  };

  const handleToggleAlarm = async (id: string, currentStatus: boolean) => {
    try {
      await toggleAlarm(id, !currentStatus);
      setAlarms(prev => prev.map(a => a.id === id ? { ...a, isEnabled: !currentStatus } : a));
    } catch (error) {
      alert('상태 변경 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="min-h-screen pb-32">
      <header className="bg-background w-full top-0 sticky z-50">
        <div className="flex justify-between items-center px-6 py-4 w-full max-w-md mx-auto">
          <div className="flex items-center gap-2">
            <AlarmClockCheck className="text-primary w-7 h-7" />
            <div>
              <h1 className="text-2xl font-black text-primary tracking-tighter">또 5분만?</h1>
              <p className="text-[10px] text-on-surface-variant font-bold leading-none mt-0.5">데이터로 더 나은 기상을 설계합니다.</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="w-10 h-10 flex items-center justify-center rounded-full bg-surface-container hover:scale-105 transition-transform">
              <Bell className="text-on-surface-variant w-5 h-5" />
            </button>
            <button onClick={signOut} className="w-10 h-10 flex items-center justify-center rounded-full bg-surface-container hover:scale-105 transition-transform text-error">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto px-6 space-y-8">
        {deleteId && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-surface-container-high w-full max-w-xs rounded-2xl p-6 shadow-2xl animate-in zoom-in-95 duration-200 border border-outline-variant/30">
              <div className="w-12 h-12 bg-error/10 text-error rounded-xl flex items-center justify-center mb-4">
                <Trash2 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-black text-on-surface mb-2">알람 삭제</h3>
              <p className="text-sm text-on-surface-variant font-medium mb-6">정말 삭제하시겠습니까? 삭제된 알람은 복구할 수 없습니다.</p>
              <div className="flex gap-3">
                <motion.button 
                  whileHover={{ 
                    x: (Math.random() - 0.5) * 8, 
                    y: (Math.random() - 0.5) * 8,
                    scale: 0.98
                  }}
                  transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                  onClick={() => setDeleteId(null)}
                  className="flex-1 py-3 bg-surface-container-highest text-on-surface-variant font-bold rounded-xl active:scale-95 transition-transform"
                >
                  취소
                </motion.button>
                <motion.button 
                  whileHover={{ 
                    x: (Math.random() - 0.5) * 8, 
                    y: (Math.random() - 0.5) * 8,
                    scale: 0.98
                  }}
                  transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                  onClick={() => {
                    handleDeleteAlarm(deleteId);
                    setDeleteId(null);
                  }}
                  className="flex-1 py-3 bg-error text-on-error font-bold rounded-xl active:scale-95 transition-transform"
                >
                  삭제
                </motion.button>
              </div>
            </div>
          </div>
        )}
        {error && (
          <div className="bg-error-container text-on-error-container p-4 rounded-xl font-bold flex items-center justify-between mb-2">
            <p className="text-sm">{error}</p>
            <button onClick={() => setError(null)} className="p-1 hover:bg-black/10 rounded-full">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
        <section className="relative bg-primary rounded-xl p-8 text-on-primary shadow-[0_8px_32px_rgba(224,64,160,0.3)] overflow-hidden">
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-white opacity-10 rounded-full"></div>
          <div className="relative z-10">
            <p className="text-primary-fixed font-bold text-sm tracking-wide mb-2">내일 아침 알람</p>
            <div className="flex items-baseline gap-2">
              <h2 className="text-7xl font-black tracking-tighter">07:30</h2>
              <span className="text-xl font-bold opacity-90 uppercase">am</span>
            </div>
            <div className="mt-6 flex items-center gap-3">
              <span className="bg-white/20 px-4 py-1.5 rounded-full text-xs font-bold backdrop-blur-sm">기상 미션: 수학 풀기</span>
              <button 
                onClick={() => onNavigate('alarm-edit')}
                className="bg-white text-primary rounded-full px-4 py-1.5 text-xs font-bold bouncy shadow-lg"
              >
                수정하기
              </button>
            </div>
          </div>
          <div className="absolute bottom-0 right-0 p-4 opacity-20">
            <Moon className="w-24 h-24" />
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-headline font-bold text-xl text-on-background">내 알람 리스트</h3>
            <button 
              onClick={() => onNavigate('alarm-edit')}
              className="text-primary flex items-center gap-1 font-bold text-sm hover:scale-105 transition-transform"
            >
              <PlusCircle className="w-4 h-4" />
              추가하기
            </button>
          </div>

          <div className="grid gap-4">
            {loading ? (
              <div className="py-10 flex justify-center">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
              </div>
            ) : alarms.length === 0 ? (
              <div className="bg-surface-container p-10 rounded-lg text-center space-y-2 opacity-60">
                <BellOff className="w-10 h-10 mx-auto text-on-surface-variant" />
                <p className="font-bold text-on-surface-variant">설정된 알람이 없습니다.</p>
              </div>
            ) : (
              alarms.map(alarm => (
                <div key={alarm.id} className="bg-surface-container p-5 rounded-lg flex justify-between items-center group hover:shadow-md transition-all border-2 border-transparent hover:border-primary-container">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={cn("text-2xl font-black transition-opacity", alarm.isEnabled ? "text-on-surface" : "text-on-surface opacity-30")}>
                        {alarm.time}
                      </span>
                      <span className="text-xs font-bold text-secondary bg-secondary-container px-2 py-0.5 rounded-full">
                        {alarm.days.length === 7 ? "매일" : alarm.days.length === 5 && !alarm.days.includes("토") ? "주중" : "사용자 지정"}
                      </span>
                    </div>
                    <p className="text-xs text-on-surface-variant font-medium">{alarm.label || "알람"}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <motion.button 
                      whileHover={{ 
                        x: (Math.random() - 0.5) * 8, 
                        y: (Math.random() - 0.5) * 8,
                        scale: 1.1
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        alarm.id && setDeleteId(alarm.id);
                      }}
                      className="p-2 text-on-surface-variant hover:text-error hover:bg-error-container/20 rounded-full transition-all opacity-40 group-hover:opacity-100"
                    >
                      <Trash2 className="w-5 h-5" />
                    </motion.button>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={alarm.isEnabled} 
                        onChange={() => alarm.id && handleToggleAlarm(alarm.id, alarm.isEnabled)}
                        className="sr-only peer" 
                      />
                      <div className="w-14 h-8 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-primary shadow-inner"></div>
                    </label>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="bg-surface-container-low p-6 rounded-xl border-2 border-primary/20 shadow-lg">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-lg text-on-surface flex items-center gap-2">
              <Moon className="w-5 h-5 text-primary" />
              수면 트래커
            </h3>
            {activeSession && (
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
            )}
          </div>
          
          <div className="flex flex-col gap-4">
            {!activeSession ? (
              <div className="text-center py-4">
                <p className="text-on-surface-variant text-sm mb-4">오늘 밤 편안한 수면을 시작할까요?</p>
                <button
                  disabled={isProcessingSleep}
                  onClick={handleStartSleep}
                  className="w-full bg-primary text-on-primary font-black py-4 rounded-xl bouncy shadow-lg flex items-center justify-center gap-2"
                >
                  {isProcessingSleep ? <Loader2 className="animate-spin w-5 h-5" /> : "🌙 취침하기"}
                </button>
              </div>
            ) : (
              <div className="text-center py-4">
                <div className="mb-4">
                  <p className="text-xs font-bold text-primary uppercase tracking-widest mb-1">취침 시작 시간</p>
                  <p className="text-3xl font-black text-on-surface">
                    {format(activeSession.startTime.toDate(), 'HH:mm')}
                  </p>
                </div>
                <button
                  disabled={isProcessingSleep}
                  onClick={handleEndSleep}
                  className="w-full bg-tertiary text-on-tertiary font-black py-4 rounded-xl bouncy shadow-lg flex items-center justify-center gap-2"
                >
                  {isProcessingSleep ? <Loader2 className="animate-spin w-5 h-5" /> : "☀️ 기상하기"}
                </button>
              </div>
            )}
          </div>
        </section>

        <section className="space-y-4">
          <h3 className="font-headline font-bold text-xl text-on-background">수면 요약</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-tertiary-container/10 p-5 rounded-xl border-2 border-tertiary-container/20 flex flex-col justify-between">
              <div>
                <Trophy className="text-tertiary mb-2 w-6 h-6" />
                <p className="text-xs font-bold text-on-tertiary-container uppercase tracking-tight">마지막 수면 점수</p>
              </div>
              <p className="text-3xl font-black text-tertiary mt-2">
                {recentSessions.length > 0 ? recentSessions[recentSessions.length - 1].score : '0'}점
              </p>
            </div>
            
            <div className="bg-secondary-container/30 p-5 rounded-xl border-2 border-secondary-container/50">
              <div className="flex justify-between items-start mb-4">
                <p className="text-xs font-bold text-on-secondary-container uppercase tracking-tight">수면 시간 (H)</p>
                <span className="text-xl font-black text-secondary">
                  {recentSessions.length > 0 ? recentSessions[recentSessions.length - 1].durationHours?.toFixed(1) : '0'}
                </span>
              </div>
              <div className="w-full bg-surface-container-highest rounded-full h-3 overflow-hidden">
                <div 
                  className="bg-secondary h-full rounded-full shadow-[0_0_8px_rgba(124,82,170,0.4)]"
                  style={{ width: `${Math.min(100, ((recentSessions[recentSessions.length - 1]?.durationHours || 0) / 8) * 100)}%` }}
                ></div>
              </div>
            </div>

            <div className="col-span-2 bg-surface-container-low p-6 rounded-xl border-2 border-outline-variant/30">
              <p className="text-xs font-bold text-on-surface-variant uppercase tracking-tight mb-4 text-center">최근 7일 수면 통계</p>
              <div className="h-40 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={recentSessions.map(s => ({
                    day: format(s.endTime?.toDate() || new Date(), 'MM/dd'),
                    score: s.score
                  }))}>
                    <XAxis 
                      dataKey="day" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 10, fontWeight: 'bold' }} 
                    />
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                      labelStyle={{ fontWeight: 'bold', fontSize: '12px' }}
                    />
                    <Bar dataKey="score" radius={[4, 4, 0, 0]}>
                      {recentSessions.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.score && entry.score > 80 ? '#E040A0' : '#8B5CF6'} 
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {recentSessions.length > 0 && recentSessions[recentSessions.length - 1].aiFeedback && (
              <div className="col-span-2 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-6 rounded-2xl border border-primary/20 relative overflow-hidden group shadow-sm transition-all duration-500 hover:shadow-md">
                <div className="absolute -top-6 -right-6 w-24 h-24 bg-primary/20 rounded-full blur-2xl group-hover:bg-primary/30 transition-colors duration-500" />
                <div className="relative z-10 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-primary/10 rounded-lg shadow-inner">
                        <Sparkles className="w-3.5 h-3.5 text-primary" />
                      </div>
                      <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">
                        AI Sleep Analysis
                      </p>
                    </div>
                    <button 
                      onClick={() => {
                        const lastSession = recentSessions[recentSessions.length - 1];
                        if (lastSession) handleCopyAndSave(lastSession);
                      }}
                      className="p-2 hover:bg-primary/10 rounded-lg transition-colors text-primary flex items-center gap-1.5"
                      title="복사 및 히스토리 저장"
                    >
                      {copied ? (
                        <>
                          <Check className="w-4 h-4" />
                          <span className="text-[10px] font-black">Saved!</span>
                        </>
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  
                  <div className="relative">
                    <span className="absolute -left-1 -top-2 text-4xl text-primary/10 font-serif italic pointer-events-none select-none">“</span>
                    <p className="text-sm text-on-surface leading-relaxed pl-4 font-medium text-pretty">
                      {recentSessions[recentSessions.length - 1].aiFeedback}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

      </main>
      
      <BottomNav activeTab="alarms" onNavigate={onNavigate} />
    </div>
  );
}
