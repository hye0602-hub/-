import { AlarmClock, CheckSquare, History, Settings, Plus } from 'lucide-react';
import { cn } from '../lib/utils';
import { Screen } from '../App';

interface BottomNavProps {
  activeTab: 'alarms' | 'missions' | 'history' | 'settings';
  onNavigate?: (screen: Screen) => void;
}

export function BottomNav({ activeTab, onNavigate }: BottomNavProps) {
  return (
    <>
      <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 pb-6 pt-3 bg-surface-container rounded-t-xl shadow-[0_-4px_16px_rgba(224,64,160,0.1)]">
        <button 
          onClick={() => onNavigate?.('dashboard')}
          className={cn(
            "flex flex-col items-center justify-center rounded-full px-4 py-1 bouncy",
            activeTab === 'alarms' ? "bg-primary text-on-primary shadow-[0_4px_12px_rgba(224,64,160,0.3)]" : "text-on-surface-variant hover:scale-110 transition-transform"
          )}
        >
          <AlarmClock className="w-6 h-6 mb-1" />
          <span className="font-label font-medium text-[10px]">Alarms</span>
        </button>
        <button 
          onClick={() => onNavigate?.('mission-select')}
          className={cn(
            "flex flex-col items-center justify-center rounded-full px-4 py-1 bouncy",
            activeTab === 'missions' ? "bg-primary text-on-primary shadow-[0_4px_12px_rgba(224,64,160,0.3)]" : "text-on-surface-variant hover:scale-110 transition-transform"
          )}
        >
          <CheckSquare className="w-6 h-6 mb-1" />
          <span className="font-label font-medium text-[10px]">Missions</span>
        </button>
        <button 
          onClick={() => onNavigate?.('history')}
          className={cn(
            "flex flex-col items-center justify-center rounded-full px-4 py-1 bouncy",
            activeTab === 'history' ? "bg-primary text-on-primary shadow-[0_4px_12px_rgba(224,64,160,0.3)]" : "text-on-surface-variant hover:scale-110 transition-transform"
          )}
        >
          <History className="w-6 h-6 mb-1" />
          <span className="font-label font-medium text-[10px]">History</span>
        </button>
        <button 
          onClick={() => onNavigate?.('settings')}
          className={cn(
            "flex flex-col items-center justify-center rounded-full px-4 py-1 bouncy",
            activeTab === 'settings' ? "bg-primary text-on-primary shadow-[0_4px_12px_rgba(224,64,160,0.3)]" : "text-on-surface-variant hover:scale-110 transition-transform"
          )}
        >
          <Settings className="w-6 h-6 mb-1" />
          <span className="font-label font-medium text-[10px]">Settings</span>
        </button>
      </nav>
    </>
  );
}
