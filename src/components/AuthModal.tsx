import React, { useState } from 'react';
import { Sparkles, X, ShieldCheck, UserCheck, AlertCircle } from 'lucide-react';
import { auth, googleProvider, signInWithPopup, signInAnonymously } from '../lib/firebase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      await signInWithPopup(auth, googleProvider);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      console.warn('Google sign-in issue (popup or iframe cookie restriction):', err);
      if (err?.code === 'auth/popup-blocked' || err?.code === 'auth/popup-closed-by-user') {
        setErrorMsg('Sign-in popup was closed or blocked. You can also sign in as a Guest Student below.');
      } else {
        setErrorMsg(err?.message || 'Failed to sign in with Google. You can use Guest Student sign-in.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGuestSignIn = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      await signInAnonymously(auth);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Guest sign-in error:', err);
      if (err?.code === 'auth/admin-restricted-operation' || err?.code === 'auth/operation-not-allowed') {
        setErrorMsg('Anonymous Authentication is currently restricted or disabled in Firebase Console (Authentication > Sign-in method > Anonymous). Please enable Anonymous Auth or Continue with Google.');
      } else {
        setErrorMsg(err?.message || 'Unable to sign in as guest.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0A0F1E]/80 backdrop-blur-md">
      <div className="glass-card rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-white/15 relative text-white backdrop-blur-2xl animate-in fade-in zoom-in-95 duration-200">
        <button
          id="close-auth-modal"
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/20 border border-blue-400/30 text-blue-300 mx-auto flex items-center justify-center mb-3 backdrop-blur-md">
            <Sparkles className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Welcome to Learn<span className="text-blue-400">Loop</span>
          </h2>
          <p className="text-slate-400 text-sm mt-1.5">
            Sign in to start personalized adaptive learning sessions and track your concept mastery.
          </p>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-amber-500/20 border border-amber-400/30 text-amber-200 text-xs flex items-start gap-2 backdrop-blur-md">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="space-y-3">
          {/* Google Sign-in */}
          <button
            id="google-signin-btn"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl border border-white/15 bg-white/[0.04] hover:bg-white/10 text-white font-semibold text-sm transition-all shadow-md active:scale-[0.99] disabled:opacity-60 cursor-pointer backdrop-blur-md"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.03h3.88c2.27-2.09 3.665-5.17 3.665-9.12z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.03c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.24v3.13C3.26 21.41 7.34 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.29c-.25-.72-.38-1.49-.38-2.29s.13-1.57.38-2.29V6.58H1.24C.45 8.15 0 9.99 0 12s.45 3.85 1.24 5.42l4.04-3.13z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.59 1.24 6.58l4.04 3.13c.95-2.83 3.6-4.96 6.72-4.96z"
              />
            </svg>
            <span>{loading ? 'Connecting...' : 'Continue with Google'}</span>
          </button>

          {/* Guest sign-in */}
          <button
            id="guest-signin-btn"
            onClick={handleGuestSignIn}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 border border-blue-400/30 text-blue-200 font-medium text-xs transition-all active:scale-[0.99] disabled:opacity-60 cursor-pointer backdrop-blur-md"
          >
            <UserCheck className="w-4 h-4 text-blue-300" />
            <span>Continue as Guest</span>
          </button>
        </div>

        <div className="mt-6 pt-5 border-t border-white/10 flex items-center justify-center gap-2 text-xs text-slate-400">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Private student data isolated with Firestore security rules</span>
        </div>
      </div>
    </div>
  );
};
