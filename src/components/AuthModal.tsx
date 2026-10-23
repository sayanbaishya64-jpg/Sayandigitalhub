import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { translations } from '../i18n/translations';
import { 
  User, Lock, Mail, Phone, X, Shield, CheckCircle2, AlertCircle, 
  Loader2, RefreshCw, Eye, EyeOff, Check, XCircle, KeyRound, Sparkles 
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'signup' | 'login' | 'forgot';
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, initialMode = 'signup' }) => {
  const { login, registerCustomer, sendPasswordResetEmail, language, signInWithGoogle, sessionRevokedMessage, clearSessionRevokedMessage } = useApp();
  const t = translations[language];

  const [mode, setMode] = useState<'signup' | 'login' | 'forgot' | 'admin'>('signup');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  // Password validation checks according to required regex:
  // /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9\s])\S{8,}$/
  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasDigit = /\d/.test(password);
  const hasSpecial = /[^A-Za-z0-9\s]/.test(password);
  const isPasswordValid = hasMinLength && hasUppercase && hasLowercase && hasDigit && hasSpecial;
  const passwordsMatch = password === confirmPassword;

  const handleGoogleAuth = async () => {
    setErrorMsg('');
    setIsLoading(true);
    try {
      const res = await signInWithGoogle();
      setIsLoading(false);
      if (res?.error) {
        setErrorMsg(res.error);
      } else {
        setSuccessMsg('Successfully signed in with Google via Firebase!');
        setTimeout(() => {
          setSuccessMsg('');
          onClose();
        }, 900);
      }
    } catch (err: any) {
      setIsLoading(false);
      setErrorMsg(err?.message || 'Failed to authenticate with Google');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!email) {
      setErrorMsg('Please enter your email address.');
      return;
    }

    if (mode === 'forgot') {
      setIsLoading(true);
      const res = await sendPasswordResetEmail(email);
      setIsLoading(false);
      if (res.error) {
        setErrorMsg(res.error);
      } else {
        setSuccessMsg(res.message || (res as any).note || 'Password reset link sent! Please check your inbox or use Google sign-in.');
      }
      return;
    }

    if (!password) {
      setErrorMsg('Please enter your password.');
      return;
    }

    if (mode === 'signup') {
      if (!isPasswordValid) {
        setErrorMsg('Password does not meet all security requirements.');
        return;
      }
      if (!passwordsMatch) {
        setErrorMsg('Passwords do not match.');
        return;
      }
      if (!name.trim()) {
        setErrorMsg('Please enter your full name.');
        return;
      }

      setIsLoading(true);
      const res = await registerCustomer(name, email, password, phone);
      setIsLoading(false);

      if (res.error) {
        if (res.error.includes('operation-not-allowed')) {
          setErrorMsg('Email registration is not yet enabled in Firebase Console. Please sign in instantly using Google above.');
        } else {
          setErrorMsg(res.error);
        }
      } else {
        setSuccessMsg(res.message || 'Account created successfully! Welcome to Sayan Digital Hub.');
        setTimeout(() => {
          setSuccessMsg('');
          onClose();
        }, 1500);
      }
    } else if (mode === 'login' || mode === 'admin') {
      setIsLoading(true);
      const res = await login(email, password);
      setIsLoading(false);

      if (res.error) {
        if (res.error.includes('operation-not-allowed')) {
          setErrorMsg('Email/password login is not enabled in Firebase Console. Please sign in using Google.');
        } else {
          setErrorMsg(res.error);
        }
      } else {
        setSuccessMsg(mode === 'admin' ? 'Successfully logged in as Administrator!' : (res.message || 'Successfully signed in!'));
        setTimeout(() => {
          setSuccessMsg('');
          onClose();
        }, 1200);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#0F172A] rounded-3xl shadow-2xl w-full max-w-lg border border-[#263B5A] text-white overflow-hidden animate-fadeIn my-8">
        
        {/* Header with Futuristic Gradient */}
        <div className="bg-gradient-to-r from-[#080D1F] via-[#0F172A] to-[#1E293B] p-6 text-white relative border-b border-[#263B5A]">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#00D4FF] to-transparent"></div>
          
          <button 
            onClick={onClose} 
            className="absolute top-4 right-4 text-[#94A3B8] hover:text-white p-2 rounded-xl hover:bg-[#263B5A]/50 transition"
            aria-label="Close Modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#7C3AED] via-[#2563EB] to-[#00D4FF] flex items-center justify-center text-white font-black text-xl shadow-lg shadow-[#2563EB]/40 border border-[#00D4FF]/50">
              {mode === 'admin' ? <Shield className="w-6 h-6 text-amber-400" /> : <Sparkles className="w-6 h-6 text-white" />}
            </div>
            <div>
              <h3 className="text-xl font-black tracking-tight text-white">
                {mode === 'signup' && 'Create Sayan Digital Hub Account'}
                {mode === 'login' && 'Sign In to Portal'}
                {mode === 'forgot' && 'Reset Your Password'}
                {mode === 'admin' && 'Administrator Portal Login'}
              </h3>
              <p className="text-xs text-[#94A3B8]">
                {mode === 'signup' && 'First-time visitors: register to unlock digital services & study materials'}
                {mode === 'login' && 'Access your personalized dashboard & bookings'}
                {mode === 'forgot' && 'Enter your registered email to receive a recovery link'}
                {mode === 'admin' && 'Restricted secure access for platform administrators'}
              </p>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {sessionRevokedMessage && (
            <div className="bg-amber-950/50 border border-amber-500/50 text-amber-300 p-4 rounded-2xl flex items-start gap-3 text-xs font-semibold">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p>{sessionRevokedMessage}</p>
                <button 
                  type="button"
                  onClick={clearSessionRevokedMessage}
                  className="mt-2 text-[10px] underline font-bold text-amber-200 hover:text-white"
                >
                  Dismiss notice
                </button>
              </div>
            </div>
          )}

          {successMsg && (
            <div className="bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 p-4 rounded-2xl flex items-center gap-3 text-xs font-semibold">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="bg-rose-950/40 border border-rose-500/40 text-rose-300 p-4 rounded-2xl flex items-start gap-3 text-xs font-semibold">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Google Auth Button (For Customer & Login Modes) */}
          {(mode === 'signup' || mode === 'login') && (
            <div className="space-y-3">
              <button
                type="button"
                onClick={handleGoogleAuth}
                disabled={isLoading}
                className="w-full py-3 px-4 bg-[#080D1F] hover:bg-[#1E293B] text-white border border-[#263B5A] hover:border-[#00D4FF] font-bold rounded-2xl shadow transition flex items-center justify-center gap-3 text-sm disabled:opacity-60 cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 text-[#00D4FF] animate-spin" />
                    <span>Connecting with Google...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                    </svg>
                    <span>Continue with Google (Instant & Secure)</span>
                  </>
                )}
              </button>

              <div className="relative flex items-center justify-center my-2">
                <div className="border-t border-[#263B5A] w-full"></div>
                <span className="bg-[#0F172A] px-3 text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest shrink-0">
                  Or use secure credentials
                </span>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-bold text-[#94A3B8] uppercase tracking-wide mb-1.5">{t.fullName}</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3.5 w-4 h-4 text-[#94A3B8]" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full pl-10 pr-4 py-2.5 bg-[#080D1F] border border-[#263B5A] rounded-xl text-sm font-medium text-white focus:border-[#00D4FF] outline-none transition"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-[#94A3B8] uppercase tracking-wide mb-1.5">{t.emailAddress}</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-[#94A3B8]" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder={mode === 'admin' ? "sayanbaishya64@gmail.com" : "your.email@gmail.com"}
                  className="w-full pl-10 pr-4 py-2.5 bg-[#080D1F] border border-[#263B5A] rounded-xl text-sm font-medium text-white focus:border-[#00D4FF] outline-none transition"
                />
              </div>
            </div>

            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-bold text-[#94A3B8] uppercase tracking-wide mb-1.5">{t.phoneNumber}</label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-3.5 w-4 h-4 text-[#94A3B8]" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="9876543210"
                    className="w-full pl-10 pr-4 py-2.5 bg-[#080D1F] border border-[#263B5A] rounded-xl text-sm font-medium text-white focus:border-[#00D4FF] outline-none transition"
                  />
                </div>
              </div>
            )}

            {mode !== 'forgot' && (
              <div>
                <label className="block text-xs font-bold text-[#94A3B8] uppercase tracking-wide mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-[#94A3B8]" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-12 py-2.5 bg-[#080D1F] border border-[#263B5A] rounded-xl text-sm font-medium text-white focus:border-[#00D4FF] outline-none transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3.5 text-[#94A3B8] hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            {/* STRONG PASSWORD CHECKLIST (Displayed in Signup Mode) */}
            {mode === 'signup' && (
              <div className="bg-[#080D1F] p-3.5 rounded-2xl border border-[#263B5A] space-y-2 text-xs">
                <p className="font-bold text-[#00D4FF] mb-1">Password Security Requirements:</p>
                <ul className="space-y-1.5 text-slate-300">
                  <li className="flex items-center gap-2">
                    {hasMinLength ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <XCircle className="w-3.5 h-3.5 text-rose-400" />}
                    <span className={hasMinLength ? 'text-emerald-300 font-medium' : 'text-slate-400'}>At least 8 characters</span>
                  </li>
                  <li className="flex items-center gap-2">
                    {hasUppercase ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <XCircle className="w-3.5 h-3.5 text-rose-400" />}
                    <span className={hasUppercase ? 'text-emerald-300 font-medium' : 'text-slate-400'}>At least one uppercase letter (A-Z)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    {hasLowercase ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <XCircle className="w-3.5 h-3.5 text-rose-400" />}
                    <span className={hasLowercase ? 'text-emerald-300 font-medium' : 'text-slate-400'}>At least one lowercase letter (a-z)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    {hasDigit ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <XCircle className="w-3.5 h-3.5 text-rose-400" />}
                    <span className={hasDigit ? 'text-emerald-300 font-medium' : 'text-slate-400'}>At least one digit (0-9)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    {hasSpecial ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <XCircle className="w-3.5 h-3.5 text-rose-400" />}
                    <span className={hasSpecial ? 'text-emerald-300 font-medium' : 'text-slate-400'}>At least one special character (!@#$%^&*)</span>
                  </li>
                </ul>
              </div>
            )}

            {/* Confirm Password field in Signup Mode */}
            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-bold text-[#94A3B8] uppercase tracking-wide mb-1.5">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-[#94A3B8]" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-12 py-2.5 bg-[#080D1F] border border-[#263B5A] rounded-xl text-sm font-medium text-white focus:border-[#00D4FF] outline-none transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3.5 top-3.5 text-[#94A3B8] hover:text-white"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {confirmPassword && !passwordsMatch && (
                  <p className="text-[11px] text-rose-400 mt-1 font-semibold">Passwords do not match.</p>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-gradient-to-r from-[#2563EB] to-[#7C3AED] hover:brightness-110 text-white font-bold rounded-xl shadow-lg shadow-[#2563EB]/30 border border-[#00D4FF]/40 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>
                {mode === 'signup' && 'Create Account & Register'}
                {mode === 'login' && 'Sign In to Portal'}
                {mode === 'forgot' && 'Send Password Reset Link'}
                {mode === 'admin' && 'Sign In as Administrator'}
              </span>
            </button>

            {/* Navigation Switchers */}
            <div className="pt-3 border-t border-[#263B5A] flex flex-col gap-2 text-center text-xs">
              {mode === 'signup' && (
                <>
                  <button
                    type="button"
                    onClick={() => { setMode('login'); setErrorMsg(''); setSuccessMsg(''); }}
                    className="text-[#00D4FF] font-semibold hover:underline"
                  >
                    Already have an account? Sign In
                  </button>
                  <button
                    type="button"
                    onClick={() => { setMode('admin'); setErrorMsg(''); setSuccessMsg(''); setEmail('sayanbaishya64@gmail.com'); }}
                    className="text-[#94A3B8] hover:text-white font-medium"
                  >
                    Administrator Portal Login
                  </button>
                </>
              )}

              {mode === 'login' && (
                <>
                  <button
                    type="button"
                    onClick={() => { setMode('signup'); setErrorMsg(''); setSuccessMsg(''); }}
                    className="text-[#00D4FF] font-semibold hover:underline"
                  >
                    Don't have an account? Register First
                  </button>
                  <button
                    type="button"
                    onClick={() => { setMode('forgot'); setErrorMsg(''); setSuccessMsg(''); }}
                    className="text-[#94A3B8] hover:text-white font-medium"
                  >
                    Forgot your password? Reset here
                  </button>
                  <button
                    type="button"
                    onClick={() => { setMode('admin'); setErrorMsg(''); setSuccessMsg(''); setEmail('sayanbaishya64@gmail.com'); }}
                    className="text-[#94A3B8] hover:text-white font-medium"
                  >
                    Administrator Portal Login
                  </button>
                </>
              )}

              {(mode === 'forgot' || mode === 'admin') && (
                <button
                  type="button"
                  onClick={() => { setMode('login'); setErrorMsg(''); setSuccessMsg(''); setEmail(''); }}
                  className="text-[#00D4FF] font-semibold hover:underline"
                >
                  Back to Customer Sign In
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
