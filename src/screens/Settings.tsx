import { useState } from 'react';
import { useAuth } from '../lib/AuthContext';
import { BottomNav } from '../components/BottomNav';
import { Screen } from '../App';
import { 
  User, 
  LogOut, 
  ChevronRight, 
  Bell, 
  ShieldCheck, 
  Info,
  CircleHelp,
  ChevronLeft,
  Moon,
  Volume2,
  CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

interface SettingsProps {
  onNavigate: (screen: Screen) => void;
}

type SettingsSection = 'main' | 'notifications' | 'privacy' | 'faq' | 'info';

export default function SettingsScreen({ onNavigate }: SettingsProps) {
  const { user, signOut } = useAuth();
  const [activeSection, setActiveSection] = useState<SettingsSection>('main');
  const [notifEnabled, setNotifEnabled] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  const handleLogout = async () => {
    if (window.confirm('정말 로그아웃 하시겠습니까?')) {
      await signOut();
    }
  };

  const renderMain = () => (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      {/* User Profile */}
      <section className="bg-surface-container rounded-2xl p-6 flex items-center gap-4 shadow-sm border border-primary/5">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center overflow-hidden border-2 border-primary/20">
          {user?.photoURL ? (
            <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            <User className="w-8 h-8 text-primary" />
          )}
        </div>
        <div>
          <h2 className="text-xl font-black text-on-surface font-headline tracking-tight">{user?.displayName || '사용자'}</h2>
          <p className="text-sm text-on-surface-variant font-medium">{user?.email}</p>
        </div>
      </section>

      {/* General Settings */}
      <div className="space-y-2">
        <p className="px-2 text-xs font-black text-on-surface-variant uppercase tracking-[0.2em] font-headline">일반 설정</p>
        <div className="bg-surface-container rounded-2xl overflow-hidden shadow-sm border border-surface-container-highest/50">
          <button 
            onClick={() => setActiveSection('notifications')}
            className="w-full flex items-center justify-between p-4 hover:bg-surface-container-highest transition-colors border-b border-surface-container-highest"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <Bell className="w-5 h-5 text-blue-500" />
              </div>
              <span className="font-headline font-bold text-on-surface tracking-tighter">알림 설정</span>
            </div>
            <ChevronRight className="w-5 h-5 text-on-surface-variant" />
          </button>
          <button 
            onClick={() => setActiveSection('privacy')}
            className="w-full flex items-center justify-between p-4 hover:bg-surface-container-highest transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-green-500" />
              </div>
              <span className="font-headline font-bold text-on-surface tracking-tighter">개인정보 보호</span>
            </div>
            <ChevronRight className="w-5 h-5 text-on-surface-variant" />
          </button>
        </div>
      </div>

      {/* Support Settings */}
      <div className="space-y-2">
        <p className="px-2 text-xs font-black text-on-surface-variant uppercase tracking-[0.2em] font-headline">고객 지원</p>
        <div className="bg-surface-container rounded-2xl overflow-hidden shadow-sm border border-surface-container-highest/50">
          <button 
            onClick={() => setActiveSection('faq')}
            className="w-full flex items-center justify-between p-4 hover:bg-surface-container-highest transition-colors border-b border-surface-container-highest"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                <CircleHelp className="w-5 h-5 text-purple-500" />
              </div>
              <span className="font-headline font-bold text-on-surface tracking-tighter">자주 묻는 질문</span>
            </div>
            <ChevronRight className="w-5 h-5 text-on-surface-variant" />
          </button>
          <button 
            onClick={() => setActiveSection('info')}
            className="w-full flex items-center justify-between p-4 hover:bg-surface-container-highest transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
                <Info className="w-5 h-5 text-orange-500" />
              </div>
              <span className="font-headline font-bold text-on-surface tracking-tighter">앱 정보</span>
            </div>
            <ChevronRight className="w-5 h-5 text-on-surface-variant" />
          </button>
        </div>
      </div>

      {/* Account Actions */}
      <div className="pt-4">
        <motion.button 
          whileTap={{ scale: 0.95 }}
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-3 p-4 bg-error-container text-on-error-container rounded-2xl font-headline font-black shadow-lg tracking-tighter"
        >
          <LogOut className="w-5 h-5" />
          로그아웃
        </motion.button>
      </div>
    </motion.div>
  );

  const renderNotifications = () => (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="space-y-6"
    >
      <div className="flex items-center gap-4 mb-2">
        <button onClick={() => setActiveSection('main')} className="p-2 -ml-2 rounded-full hover:bg-surface-container-highest transition-colors">
          <ChevronLeft className="w-6 h-6 text-on-background" />
        </button>
        <h2 className="text-xl font-black text-on-background font-headline tracking-tighter">알림 설정</h2>
      </div>
      
      <div className="bg-surface-container rounded-2xl divide-y divide-surface-container-highest overflow-hidden border border-surface-container-highest/50 shadow-sm">
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <Bell className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className="font-headline font-bold text-on-surface tracking-tighter">푸시 알림</p>
              <p className="text-xs text-on-surface-variant font-medium">알람 및 중요 공지 알림</p>
            </div>
          </div>
          <button 
            onClick={() => setNotifEnabled(!notifEnabled)}
            className={cn(
              "w-12 h-6 rounded-full relative transition-colors duration-300",
              notifEnabled ? "bg-primary" : "bg-surface-container-highest"
            )}
          >
            <div className={cn(
              "absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform duration-300",
              notifEnabled ? "translate-x-6" : "translate-x-0"
            )} />
          </button>
        </div>
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center">
              <Volume2 className="w-5 h-5 text-secondary" />
            </div>
            <div>
              <p className="font-headline font-bold text-on-surface tracking-tighter">알림음</p>
              <p className="text-xs text-on-surface-variant font-medium">선택한 알람 사운드 사용</p>
            </div>
          </div>
          <span className="text-sm font-black text-primary font-headline">활성화</span>
        </div>
      </div>
    </motion.div>
  );

  const renderPrivacy = () => (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="space-y-6"
    >
      <div className="flex items-center gap-4 mb-2">
        <button onClick={() => setActiveSection('main')} className="p-2 -ml-2 rounded-full hover:bg-surface-container-highest transition-colors">
          <ChevronLeft className="w-6 h-6 text-on-background" />
        </button>
        <h2 className="text-xl font-black text-on-background font-headline tracking-tighter">개인정보 보호</h2>
      </div>

      <div className="bg-surface-container rounded-2xl p-6 border border-surface-container-highest/50 shadow-sm space-y-4">
        <div className="flex items-center gap-3 text-primary">
          <ShieldCheck className="w-6 h-6" />
          <h3 className="font-headline font-bold tracking-tighter">데이터 수집 및 이용</h3>
        </div>
        <div className="space-y-3 text-sm text-on-surface-variant leading-relaxed">
          <p>• 기상알라미는 사용자의 더 나은 수면 경험을 위해 수면 시간 및 미션 달성 데이터를 기록합니다.</p>
          <p>• 모든 데이터는 사용자의 계정에 안전하게 보관되며, 언제든지 삭제를 요청할 수 있습니다.</p>
          <p>• 제3자에게 데이터를 제공하거나 판매하지 않습니다.</p>
        </div>
        <button className="w-full py-3 rounded-xl bg-surface-container-highest text-on-surface font-bold text-sm mt-4">
          데이터 전체 삭제하기
        </button>
      </div>
    </motion.div>
  );

  const renderFAQ = () => (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="space-y-6"
    >
      <div className="flex items-center gap-4 mb-2">
        <button onClick={() => setActiveSection('main')} className="p-2 -ml-2 rounded-full hover:bg-surface-container-highest transition-colors">
          <ChevronLeft className="w-6 h-6 text-on-background" />
        </button>
        <h2 className="text-xl font-black text-on-background font-headline tracking-tighter">자주 묻는 질문</h2>
      </div>

      <div className="space-y-3">
        {[
          { q: "미션을 꼭 수행해야 알람이 꺼지나요?", a: "기상알라미의 핵심은 기상을 돕는 것입니다. 설정한 미션을 완료해야만 알람이 중단됩니다." },
          { q: "페널티는 어떤 경우에 발생하나요?", a: "기상 후 다시 수면 모드로 진입하거나 미션을 건너뛰는 경우 소정의 포인트 페널티가 발생할 수 있습니다." },
          { q: "알람 볼륨을 더 키울 수 없나요?", a: "알람 설정에서 '폭풍 알람' 모드를 활성화하면 비상벨 수준의 큰 소리가 재생됩니다." }
        ].map((item, i) => (
          <details key={i} className="group bg-surface-container rounded-2xl border border-surface-container-highest/50 shadow-sm overflow-hidden">
            <summary className="list-none p-4 flex items-center justify-between cursor-pointer group-open:bg-surface-container-highest/30">
              <span className="font-headline font-bold text-on-surface pr-4 tracking-tighter">{item.q}</span>
              <ChevronRight className="w-5 h-5 text-on-surface-variant transition-transform group-open:rotate-90" />
            </summary>
            <div className="p-4 pt-0 text-sm text-on-surface-variant leading-relaxed">
              {item.a}
            </div>
          </details>
        ))}
      </div>
    </motion.div>
  );

  const renderInfo = () => (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="space-y-6"
    >
      <div className="flex items-center gap-4 mb-2">
        <button onClick={() => setActiveSection('main')} className="p-2 -ml-2 rounded-full hover:bg-surface-container-highest transition-colors">
          <ChevronLeft className="w-6 h-6 text-on-background" />
        </button>
        <h2 className="text-xl font-black text-on-background font-headline tracking-tighter">앱 정보</h2>
      </div>

      <div className="flex flex-col items-center py-8">
        <div className="w-24 h-24 bg-primary rounded-[2rem] flex items-center justify-center shadow-xl mb-4 rotate-3">
          <Bell className="w-12 h-12 text-on-primary fill-current" />
        </div>
        <h3 className="text-2xl font-black text-on-background font-headline tracking-tighter">기상알라미</h3>
        <p className="text-on-surface-variant font-bold">Version 1.2.4 (Stable)</p>
      </div>

      <div className="bg-surface-container rounded-2xl divide-y divide-surface-container-highest border border-surface-container-highest/50 shadow-sm overflow-hidden">
        <div className="p-4 flex items-center justify-between">
          <span className="font-headline font-bold text-on-surface tracking-tighter">개발사</span>
          <span className="text-on-surface-variant font-medium">WakeUp Lab</span>
        </div>
        <div className="p-4 flex items-center justify-between">
          <span className="font-headline font-bold text-on-surface tracking-tighter">최근 업데이트</span>
          <span className="text-on-surface-variant font-medium">2024.05.15</span>
        </div>
        <div className="p-4 flex items-center justify-between">
          <span className="font-headline font-bold text-on-surface tracking-tighter">상태</span>
          <div className="flex items-center gap-1 text-green-500 font-headline">
            <CheckCircle2 className="w-4 h-4" />
            <span className="text-sm font-bold tracking-tighter">최신버전</span>
          </div>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen pb-32 bg-background flex flex-col">
      <header className="px-6 pt-12 pb-6">
        <h1 className="text-3xl font-black text-on-background font-headline tracking-tighter">설정</h1>
      </header>

      <main className="flex-1 px-4 overflow-hidden">
        <AnimatePresence mode="wait">
          {activeSection === 'main' && renderMain()}
          {activeSection === 'notifications' && renderNotifications()}
          {activeSection === 'privacy' && renderPrivacy()}
          {activeSection === 'faq' && renderFAQ()}
          {activeSection === 'info' && renderInfo()}
        </AnimatePresence>
      </main>

      <BottomNav activeTab="settings" onNavigate={onNavigate} />
    </div>
  );
}
