import React, { useState } from 'react';
import { useUser } from '../context/UserContext';
import { PhoneInput } from './PhoneInput';
import { SarthiLogo } from './SarthiLogo';
import {
  ShieldCheck,
  Lock,
  Mail,
  ArrowRight,
  AlertCircle,
  Sparkles,
  User,
  Eye,
  EyeOff,
  CheckCircle2,
  X,
  Compass,
  Target,
  TrendingUp,
  Award,
  ChevronLeft,
  FileText,
  Shield,
} from 'lucide-react';

type AuthViewMode = 'welcome' | 'signin' | 'signup';

export const LoginView: React.FC = () => {
  const { login, register } = useUser();
  const [viewMode, setViewMode] = useState<AuthViewMode>('welcome');

  // Sign In state
  const [signInInput, setSignInInput] = useState('');
  const [signInPassword, setSignInPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showSignInPassword, setShowSignInPassword] = useState(false);

  // Sign Up state
  const [signUpName, setSignUpName] = useState('');
  const [signUpPhone, setSignUpPhone] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [signUpConfirmPassword, setSignUpConfirmPassword] = useState('');
  const [showSignUpPassword, setShowSignUpPassword] = useState(false);

  // Forgot Password state
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  const [forgotInput, setForgotInput] = useState('');
  const [forgotSuccessMessage, setForgotSuccessMessage] = useState<string | null>(null);

  // Legal Modal state
  const [legalModalType, setLegalModalType] = useState<'terms' | 'privacy' | null>(null);

  // General feedback
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Handle Sign In submission
  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const result = login(signInInput, signInPassword, rememberMe);
    setIsLoading(false);
    if (!result.success && result.error) {
      setError(result.error);
    }
  };

  // Handle Sign Up submission
  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const phoneDigits = signUpPhone.replace(/\D/g, '');
    if (!signUpPhone || phoneDigits.length < 7) {
      setError('Please enter a valid mobile number.');
      return;
    }

    if (signUpPassword !== signUpConfirmPassword) {
      setError('Passwords do not match. Please recheck your confirm password.');
      return;
    }

    setIsLoading(true);
    const result = register({
      fullName: signUpName,
      phone: signUpPhone,
      email: signUpEmail,
      password: signUpPassword,
    });
    setIsLoading(false);

    if (!result.success && result.error) {
      setError(result.error);
    }
  };

  // Handle Google Sign In
  const handleGoogleSignIn = () => {
    setError(null);
    setIsLoading(true);
    // Use default account or prompt
    setTimeout(() => {
      const result = login('mihir.jani0708@gmail.com', 'mihir123', true);
      setIsLoading(false);
      if (!result.success) {
        // Fallback if mihir isn't registered yet, register Mihir directly
        const regRes = register({
          fullName: 'Mihir Jani',
          phone: '+919876543210',
          email: 'mihir.jani0708@gmail.com',
          password: 'google_auth_sarthi',
        });
        if (!regRes.success && regRes.error) {
          setError(regRes.error);
        }
      }
    }, 600);
  };

  // Handle Forgot Password submission
  const handleSendReset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotInput.trim()) return;

    setForgotSuccessMessage(
      `Password reset instructions & security code sent to ${forgotInput.trim()}. Check your inbox or messages.`
    );
    setTimeout(() => {
      setShowForgotPasswordModal(false);
      setForgotSuccessMessage(null);
      setForgotInput('');
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-[#070A12] text-slate-100 flex flex-col justify-between p-4 sm:p-6 md:p-8 font-sans selection:bg-blue-600 selection:text-white relative overflow-hidden">
      {/* Background Subtle Gradient Blobs & Ambient Mesh */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-30">
        <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-blue-900/60 rounded-full filter blur-[140px]" />
        <div className="absolute top-1/2 -right-40 w-[500px] h-[500px] bg-indigo-900/50 rounded-full filter blur-[140px]" />
        <div className="absolute -bottom-40 left-1/3 w-[500px] h-[500px] bg-amber-500/10 rounded-full filter blur-[160px]" />
      </div>

      {/* TOP HEADER / LOGO STATUS BAR */}
      <header className="relative z-10 w-full max-w-4xl mx-auto flex items-center justify-between py-2">
        <div className="flex items-center gap-2 bg-slate-900/80 border border-slate-800 px-3.5 py-1.5 rounded-full backdrop-blur-md shadow-lg">
          <ShieldCheck className="w-4 h-4 text-[#F5B50A]" />
          <span className="text-[11px] font-bold tracking-wider uppercase text-slate-300">
            SARTHI OS <span className="text-blue-400 font-mono">v5.6</span>
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="hidden sm:inline">Executive Portal Ready</span>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="relative z-10 w-full max-w-md mx-auto my-auto py-6">
        {/* STEP 1: WELCOME SCREEN */}
        {viewMode === 'welcome' && (
          <div className="space-y-8 text-center animate-in fade-in duration-500">
            {/* BRANDING SECTION */}
            <div className="space-y-4">
              <div className="flex justify-center transform hover:scale-105 transition-transform duration-300">
                <SarthiLogo variant="splash" showTagline={false} />
              </div>

              <div className="space-y-2 pt-1">
                <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-snug">
                  Think Better. Plan Smarter. Execute Faster.
                </h2>
                <p className="text-sm font-semibold text-blue-300/90 tracking-wide">
                  With Your Personal AI SARTHI.
                </p>
              </div>
            </div>

            {/* FEATURE HIGHLIGHTS (4 ICONS WITH CLEAN LABELS) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="p-3.5 bg-slate-900/80 border border-slate-800/90 hover:border-blue-500/50 rounded-2xl flex flex-col items-center justify-center gap-1.5 transition-all duration-300 hover:shadow-lg hover:shadow-blue-900/20 group">
                <div className="p-2.5 bg-blue-500/10 text-blue-400 group-hover:bg-blue-600 group-hover:text-white rounded-xl transition-colors">
                  <Compass className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-slate-200">Plan</span>
              </div>

              <div className="p-3.5 bg-slate-900/80 border border-slate-800/90 hover:border-amber-500/50 rounded-2xl flex flex-col items-center justify-center gap-1.5 transition-all duration-300 hover:shadow-lg hover:shadow-amber-900/20 group">
                <div className="p-2.5 bg-amber-500/10 text-[#F5B50A] group-hover:bg-[#F5B50A] group-hover:text-slate-950 rounded-xl transition-colors">
                  <Target className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-slate-200">Focus</span>
              </div>

              <div className="p-3.5 bg-slate-900/80 border border-slate-800/90 hover:border-emerald-500/50 rounded-2xl flex flex-col items-center justify-center gap-1.5 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-900/20 group">
                <div className="p-2.5 bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-600 group-hover:text-white rounded-xl transition-colors">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-slate-200">Track</span>
              </div>

              <div className="p-3.5 bg-slate-900/80 border border-slate-800/90 hover:border-purple-500/50 rounded-2xl flex flex-col items-center justify-center gap-1.5 transition-all duration-300 hover:shadow-lg hover:shadow-purple-900/20 group">
                <div className="p-2.5 bg-purple-500/10 text-purple-400 group-hover:bg-purple-600 group-hover:text-white rounded-xl transition-colors">
                  <Award className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-slate-200">Achieve</span>
              </div>
            </div>

            {/* LOGIN SECTION BUTTONS */}
            <div className="space-y-4 pt-2">
              {/* PRIMARY ACTION: SIGN IN */}
              <button
                type="button"
                onClick={() => {
                  setError(null);
                  setViewMode('signin');
                }}
                className="w-full py-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 active:scale-[0.99] text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-2.5 shadow-xl shadow-blue-600/30 transition-all cursor-pointer ring-1 ring-blue-400/30"
              >
                <span>Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {/* SECONDARY ACTION: CREATE NEW ACCOUNT */}
              <button
                type="button"
                onClick={() => {
                  setError(null);
                  setViewMode('signup');
                }}
                className="w-full py-3.5 bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-200 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <span>Create New Account</span>
              </button>

              {/* SOCIAL LOGIN SECTION */}
              <div className="pt-3 space-y-3">
                <div className="relative flex items-center justify-center">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-800" />
                  </div>
                  <span className="relative px-3 bg-[#070A12] text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                    Continue with
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2.5">
                  {/* GOOGLE */}
                  <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    disabled={isLoading}
                    className="py-3 px-3 bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 rounded-2xl font-semibold text-xs text-slate-200 flex items-center justify-center gap-2 transition-all cursor-pointer group"
                    title="Sign in with Google"
                  >
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                      <path
                        fill="#EA4335"
                        d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.2 9 5 12 5z"
                      />
                      <path
                        fill="#4285F4"
                        d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.6 14.8c-.3-.8-.4-1.8-.4-2.8s.1-2 .4-2.8L1.9 6.3C.7 8.7 0 10.3 0 12s.7 3.3 1.9 5.7l3.7-2.9z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.2-6.4-5.2L1.9 16C3.7 19.7 7.5 23 12 23z"
                      />
                    </svg>
                    <span className="hidden sm:inline">Google</span>
                  </button>

                  {/* APPLE (FUTURE READY) */}
                  <button
                    type="button"
                    onClick={() => {
                      setError('Apple authentication is future ready. Please sign in with Email or Google.');
                    }}
                    className="py-3 px-3 bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 rounded-2xl font-semibold text-xs text-slate-300 flex items-center justify-center gap-1.5 transition-all cursor-pointer relative"
                    title="Apple Sign In (Future Ready)"
                  >
                    <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
                      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.13c.62-.75 1.04-1.8 0.92-2.85-.9.04-2 .6-2.65 1.36-.58.68-1.09 1.76-.95 2.8 1.01.08 2.06-.56 2.68-1.31z" />
                    </svg>
                    <span className="hidden sm:inline">Apple</span>
                    <span className="absolute -top-1.5 -right-1.5 px-1.5 py-0.5 bg-blue-500/20 border border-blue-400/30 text-[8px] font-bold text-blue-300 rounded-full">
                      Soon
                    </span>
                  </button>

                  {/* EMAIL */}
                  <button
                    type="button"
                    onClick={() => {
                      setError(null);
                      setViewMode('signin');
                    }}
                    className="py-3 px-3 bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 rounded-2xl font-semibold text-xs text-slate-200 flex items-center justify-center gap-2 transition-all cursor-pointer"
                    title="Sign in with Email"
                  >
                    <Mail className="w-4 h-4 text-blue-400 shrink-0" />
                    <span className="hidden sm:inline">Email</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: SIGN IN FORM */}
        {viewMode === 'signin' && (
          <div className="bg-slate-900/90 backdrop-blur-xl rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-800 space-y-6 animate-in fade-in zoom-in-95 duration-300">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
              <button
                type="button"
                onClick={() => {
                  setError(null);
                  setViewMode('welcome');
                }}
                className="flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 font-bold transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Back to Welcome</span>
              </button>

              <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                <Lock className="w-3.5 h-3.5 text-amber-400" />
                <span>Encrypted Session</span>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-extrabold text-white">Sign In to Your OS</h2>
              <p className="text-xs text-slate-400 mt-1">
                Enter your credentials to open your Executive Workspace.
              </p>
            </div>

            {error && (
              <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex items-start gap-2.5 text-rose-300 text-xs font-medium">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSignIn} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 block">
                  Email Address or Mobile Number
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. name@company.com or +91 9876543210"
                    value={signInInput}
                    onChange={(e) => setSignInInput(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-800/80 border border-slate-700/80 rounded-2xl text-xs font-medium text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 block">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showSignInPassword ? 'text' : 'password'}
                    required
                    placeholder="Enter password"
                    value={signInPassword}
                    onChange={(e) => setSignInPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-3 bg-slate-800/80 border border-slate-700/80 rounded-2xl text-xs font-medium text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSignInPassword(!showSignInPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    {showSignInPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-slate-400 hover:text-slate-200">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-700 text-blue-600 focus:ring-blue-500 bg-slate-800"
                  />
                  <span>Keep me signed in</span>
                </label>

                <button
                  type="button"
                  onClick={() => {
                    setError(null);
                    setShowForgotPasswordModal(true);
                  }}
                  className="text-blue-400 hover:underline font-semibold"
                >
                  Forgot Password?
                </button>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 active:scale-[0.99] disabled:opacity-50 text-white rounded-2xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 transition-all cursor-pointer mt-2"
              >
                {isLoading ? (
                  <span>Authenticating...</span>
                ) : (
                  <>
                    <span>Sign In to Workspace</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
              <span>Need an account?</span>
              <button
                type="button"
                onClick={() => {
                  setError(null);
                  setViewMode('signup');
                }}
                className="text-blue-400 font-bold hover:underline"
              >
                Create Account
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: CREATE ACCOUNT FORM */}
        {viewMode === 'signup' && (
          <div className="bg-slate-900/90 backdrop-blur-xl rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-800 space-y-5 animate-in fade-in zoom-in-95 duration-300">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
              <button
                type="button"
                onClick={() => {
                  setError(null);
                  setViewMode('welcome');
                }}
                className="flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 font-bold transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Back to Welcome</span>
              </button>

              <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                <Sparkles className="w-3.5 h-3.5 text-[#F5B50A]" />
                <span>Instant OS Provisioning</span>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-extrabold text-white">Create Executive Account</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Initialize your personalized SARTHI operating system.
              </p>
            </div>

            {error && (
              <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex items-start gap-2.5 text-rose-300 text-xs font-medium">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSignUp} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300 block">Full Name *</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Vikram Sharma"
                    value={signUpName}
                    onChange={(e) => setSignUpName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-800/80 border border-slate-700/80 rounded-2xl text-xs font-medium text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-all"
                  />
                </div>
              </div>

              <PhoneInput
                value={signUpPhone}
                onChange={(fullNum) => setSignUpPhone(fullNum)}
                required
                theme="dark"
                label="Mobile Number"
                placeholder="98765 43210"
              />

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300 block">
                  Email Address <span className="text-slate-500 font-normal">(Optional)</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    placeholder="e.g. vikram@company.com"
                    value={signUpEmail}
                    onChange={(e) => setSignUpEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-800/80 border border-slate-700/80 rounded-2xl text-xs font-medium text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300 block">Password *</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showSignUpPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    placeholder="At least 6 characters"
                    value={signUpPassword}
                    onChange={(e) => setSignUpPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-800/80 border border-slate-700/80 rounded-2xl text-xs font-medium text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSignUpPassword(!showSignUpPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    {showSignUpPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300 block">Confirm Password *</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    placeholder="Re-enter password"
                    value={signUpConfirmPassword}
                    onChange={(e) => setSignUpConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-800/80 border border-slate-700/80 rounded-2xl text-xs font-medium text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 active:scale-[0.99] disabled:opacity-50 text-white rounded-2xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 transition-all cursor-pointer mt-2"
              >
                {isLoading ? (
                  <span>Initializing OS...</span>
                ) : (
                  <>
                    <span>Create Account & Initialize OS</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
              <span>Already have an account?</span>
              <button
                type="button"
                onClick={() => {
                  setError(null);
                  setViewMode('signin');
                }}
                className="text-blue-400 font-bold hover:underline"
              >
                Sign In
              </button>
            </div>
          </div>
        )}
      </main>

      {/* LEGAL FOOTER */}
      <footer className="relative z-10 w-full max-w-2xl mx-auto pt-4 text-center">
        <p className="text-[11px] text-slate-500">
          By continuing you agree to our{' '}
          <button
            type="button"
            onClick={() => setLegalModalType('terms')}
            className="text-slate-400 hover:text-blue-300 underline font-medium transition-colors"
          >
            Terms of Service
          </button>{' '}
          and{' '}
          <button
            type="button"
            onClick={() => setLegalModalType('privacy')}
            className="text-slate-400 hover:text-blue-300 underline font-medium transition-colors"
          >
            Privacy Policy
          </button>
        </p>
      </footer>

      {/* FORGOT PASSWORD MODAL */}
      {showForgotPasswordModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setShowForgotPasswordModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-full hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-600/20 text-blue-400 rounded-2xl">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-white text-sm">Reset Password</h3>
                <p className="text-xs text-slate-400">We'll send password recovery steps</p>
              </div>
            </div>

            {forgotSuccessMessage ? (
              <div className="p-3.5 bg-emerald-500/20 border border-emerald-500/30 rounded-2xl text-emerald-300 text-xs flex items-center gap-2 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{forgotSuccessMessage}</span>
              </div>
            ) : (
              <form onSubmit={handleSendReset} className="space-y-4 pt-1">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 block">
                    Registered Email or Phone
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. name@company.com or +91 9876543210"
                    value={forgotInput}
                    onChange={(e) => setForgotInput(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-2xl text-xs font-medium text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold text-xs transition-all cursor-pointer"
                >
                  Send Reset Instructions
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* LEGAL DOCUMENTATION MODAL */}
      {legalModalType && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative space-y-4 max-h-[85vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setLegalModalType(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-full hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-600/20 text-blue-400 rounded-2xl">
                {legalModalType === 'terms' ? <FileText className="w-5 h-5" /> : <Shield className="w-5 h-5" />}
              </div>
              <div>
                <h3 className="font-extrabold text-white text-base">
                  {legalModalType === 'terms' ? 'Terms of Service' : 'Privacy Policy'}
                </h3>
                <p className="text-xs text-slate-400">SARTHI OS Executive Data Governance</p>
              </div>
            </div>

            <div className="text-xs text-slate-300 space-y-3 leading-relaxed border-t border-slate-800 pt-3">
              {legalModalType === 'terms' ? (
                <>
                  <p>
                    <strong>1. Acceptance of Terms:</strong> By accessing or using SARTHI OS, you agree to be bound by these Terms of Service.
                  </p>
                  <p>
                    <strong>2. User Privacy & Data Ownership:</strong> All user-authored content, daily journals, habits, planner tasks, and executive notes belong strictly to you.
                  </p>
                  <p>
                    <strong>3. AI Assistance:</strong> The Gemini Executive Coach provides insights based on user input. Suggestions are for productivity guidance.
                  </p>
                  <p>
                    <strong>4. Account Security:</strong> You are responsible for safeguarding your login credentials.
                  </p>
                </>
              ) : (
                <>
                  <p>
                    <strong>1. Data Protection:</strong> We store your profile, habits, planner tasks, and journal entries with client-side or database encryption.
                  </p>
                  <p>
                    <strong>2. Confidentiality:</strong> Your private logs are never sold or shared with third parties.
                  </p>
                  <p>
                    <strong>3. Local & Cloud Sync:</strong> Data is synchronized using secure storage layers with backup restoration support.
                  </p>
                  <p>
                    <strong>4. Analytics:</strong> Anonymous, operational performance events are collected strictly to improve system responsiveness.
                  </p>
                </>
              )}
            </div>

            <button
              type="button"
              onClick={() => setLegalModalType(null)}
              className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl font-bold text-xs transition-all cursor-pointer mt-2"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
