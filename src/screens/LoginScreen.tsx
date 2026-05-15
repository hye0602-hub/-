import { AlarmClockCheck, Loader2 } from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import { useState } from 'react';

export default function LoginScreen() {
  const { signIn } = useAuth();
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignIn = async () => {
    setIsLoggingIn(true);
    setError(null);
    try {
      await signIn();
    } catch (err) {
      console.error("Login failed:", err);
      setError("로그인에 실패했습니다. 네트워크 연결을 확인해주세요.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md bg-surface-container rounded-2xl p-8 text-center shadow-[0_8px_32px_rgba(224,64,160,0.1)] flex flex-col items-center">
        <div className="w-20 h-20 bg-primary-fixed rounded-full flex items-center justify-center mb-6 shadow-inner">
          <AlarmClockCheck className="w-10 h-10 text-primary" />
        </div>
        
        <h1 className="text-3xl font-black text-on-surface mb-2 tracking-tighter">또 5분만?</h1>
        <p className="text-on-surface-variant font-medium mb-10">상쾌한 아침을 위한 첫 걸음</p>

        {error && (
          <div className="mb-6 p-4 bg-error-container text-on-error-container rounded-xl text-sm font-bold">
            {error}
          </div>
        )}

        <button 
          onClick={handleSignIn}
          disabled={isLoggingIn}
          className="w-full py-4 bg-primary text-on-primary font-bold text-lg rounded-full shadow-[0_4px_16px_rgba(224,64,160,0.4)] hover:scale-105 transition-transform active:scale-95 flex items-center justify-center gap-3 disabled:opacity-70 disabled:scale-100"
        >
          {isLoggingIn ? (
            <Loader2 className="w-6 h-6 animate-spin" />
          ) : (
            <>
              <svg className="w-6 h-6 bg-white rounded-full p-1" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                <path d="M1 1h22v22H1z" fill="none"/>
              </svg>
              Google로 시작하기
            </>
          )}
        </button>
      </div>
    </div>
  );
}
