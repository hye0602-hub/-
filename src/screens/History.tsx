import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  AlarmClockCheck, 
  History as HistoryIcon, 
  Calendar, 
  CheckCircle2, 
  Loader2, 
  Trash2, 
  Moon, 
  Sun, 
  Trophy, 
  Sparkles 
} from 'lucide-react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Screen } from '../App';
import { BottomNav } from '../components/BottomNav';
import { getUserMissions, deleteMission, MissionData } from '../lib/missions';
import { useAuth } from '../lib/AuthContext';

interface HistoryProps {
  onNavigate: (screen: Screen) => void;
}

export default function History({ onNavigate }: HistoryProps) {
  const [missions, setMissions] = useState<(MissionData & { id: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const { user } = useAuth();

  const handleDelete = async (id: string) => {
    try {
      // Optimistic UI update
      setMissions((prev) => prev.filter((m) => m.id !== id));
      await deleteMission(id);
    } catch (error) {
      console.error("Failed to delete mission:", error);
      // Rollback if needed
      const data = await getUserMissions();
      if (data) setMissions(data as (MissionData & { id: string })[]);
    }
  };

  useEffect(() => {
    async function loadHistory() {
      if (!user) return;
      try {
        const data = await getUserMissions();
        if (data) {
          const missionData = data as (MissionData & { id: string })[];
          // Sort by creation date descending
          const sorted = missionData.sort((a, b) => {
            const dateA = a.createdAt?.seconds || 0;
            const dateB = b.createdAt?.seconds || 0;
            return dateB - dateA;
          });
          setMissions(sorted);
        }
      } catch (error) {
        console.error("Failed to load history:", error);
      } finally {
        setLoading(false);
      }
    }
    loadHistory();
  }, [user]);

  return (
    <div className="min-h-screen pb-32 bg-background">
      <header className="bg-background w-full top-0 sticky z-50">
        <div className="flex justify-between items-center px-6 py-4 w-full max-w-md mx-auto">
          <div className="flex items-center gap-2">
            <AlarmClockCheck className="text-primary w-7 h-7" />
            <h1 className="text-2xl font-black text-primary tracking-tighter">또 5분만?</h1>
          </div>
          <div className="w-10 h-10 flex items-center justify-center rounded-full bg-surface-container">
            <HistoryIcon className="text-on-surface-variant w-5 h-5" />
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto px-6 space-y-6">
        <header>
          <h2 className="text-3xl font-headline font-bold text-on-surface mb-2">기상 히스토리</h2>
          <p className="text-on-surface-variant font-medium">나의 꾸준한 노력을 확인해보세요!</p>
        </header>

        {deleteId && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-surface-container-high w-full max-w-xs rounded-2xl p-6 shadow-2xl animate-in zoom-in-95 duration-200 border border-outline-variant/30">
              <div className="w-12 h-12 bg-error/10 text-error rounded-xl flex items-center justify-center mb-4">
                <Trash2 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-black text-on-surface mb-2">기록 삭제</h3>
              <p className="text-sm text-on-surface-variant font-medium mb-6">정말 삭제하시겠습니까? 삭제된 기록은 복구할 수 없습니다.</p>
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
                    handleDelete(deleteId);
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

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
            <p className="text-on-surface-variant font-bold">기록 불러오는 중...</p>
          </div>
        ) : missions.length === 0 ? (
          <div className="bg-surface-container rounded-xl p-10 text-center space-y-4">
            <Calendar className="w-12 h-12 text-outline mx-auto opacity-50" />
            <p className="text-on-surface-variant font-bold">아직 완료한 미션이 없습니다.</p>
            <button 
              onClick={() => onNavigate('dashboard')}
              className="px-6 py-2 bg-primary text-on-primary rounded-full font-bold bouncy"
            >
              알람 설정하기
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {missions.map((mission) => {
              const date = mission.createdAt?.toDate ? mission.createdAt.toDate() : new Date();
              return (
                <div 
                  key={mission.id}
                  className="bg-white p-6 rounded-2xl border border-outline-variant/30 shadow-sm space-y-4 group hover:shadow-md transition-shadow relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
                  
                  <div className="flex items-center gap-4 relative">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center">
                        <p className="text-sm font-black text-on-surface">
                          {format(date, 'yyyy년 MM월 dd일', { locale: ko })}
                        </p>
                        <motion.button 
                          whileHover={{ 
                            x: (Math.random() - 0.5) * 8, 
                            y: (Math.random() - 0.5) * 8,
                            scale: 1.1
                          }}
                          onClick={() => setDeleteId(mission.id)}
                          className="p-2 text-on-surface-variant hover:text-error hover:bg-error/10 rounded-full transition-all active:scale-90"
                          title="기록 삭제"
                        >
                          <Trash2 className="w-4 h-4" />
                        </motion.button>
                      </div>
                      <div className="mt-1 flex items-center gap-2">
                        <span className="text-[10px] font-bold text-secondary bg-secondary/10 px-2 py-0.5 rounded-full uppercase tracking-tight">
                          Success
                        </span>
                        {mission.score !== undefined && mission.score > 0 && (
                          <div className="flex items-center gap-1">
                            <Trophy className="w-3 h-3 text-tertiary" />
                            <span className="text-xs font-black text-tertiary">{mission.score}점</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 relative">
                    <div className="bg-surface-container/50 p-3 rounded-xl border border-outline-variant/10">
                      <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                        <Moon className="w-3 h-3 text-primary" />
                        Sleep Start
                      </p>
                      <p className="text-lg font-black text-on-surface">{mission.sleepAt}</p>
                    </div>
                    <div className="bg-surface-container/50 p-3 rounded-xl border border-outline-variant/10">
                      <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                        <Sun className="w-3 h-3 text-secondary" />
                        Wake Up
                      </p>
                      <p className="text-lg font-black text-on-surface">{mission.wakeupAt}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-outline-variant/20 pt-3">
                    <span className="text-[10px] bg-outline-variant/20 px-2.5 py-1 rounded-lg font-black text-on-surface-variant uppercase tracking-wider">
                      Method: {mission.missionType === 'manual' ? 'Standard' : `${mission.missionType} Mission`}
                    </span>
                    {mission.intensity && mission.intensity !== 'none' && (
                      <span className="text-[10px] bg-tertiary/10 px-2.5 py-1 rounded-lg font-black text-tertiary uppercase tracking-wider">
                        Level: {mission.intensity}
                      </span>
                    )}
                    {mission.durationHours !== undefined && mission.durationHours > 0 && (
                      <span className="text-[10px] bg-secondary/10 px-2.5 py-1 rounded-lg font-black text-secondary uppercase tracking-wider">
                        Duration: {mission.durationHours.toFixed(1)}H
                      </span>
                    )}
                  </div>

                  {mission.aiFeedback && (
                    <div className="p-4 bg-gradient-to-br from-primary/5 to-transparent rounded-2xl border border-primary/10 relative group">
                      <Sparkles className="w-3 h-3 text-primary/30 absolute top-3 right-3" />
                      <p className="text-xs text-on-surface leading-relaxed font-medium italic">
                        "{mission.aiFeedback}"
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>

      <BottomNav activeTab="history" onNavigate={onNavigate} />
    </div>
  );
}
