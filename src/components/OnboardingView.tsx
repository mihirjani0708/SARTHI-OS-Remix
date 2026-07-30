import React, { useState } from 'react';
import { PROFILE_OPTIONS, ProfileOption } from '../data/onboardingProfiles';
import { SarthiLogo } from './SarthiLogo';
import {
  GraduationCap,
  Briefcase,
  Code,
  Users,
  Rocket,
  Building2,
  BookOpen,
  HeartPulse,
  Palette,
  Home,
  Sparkles,
  Check,
  ArrowRight,
  ShieldCheck,
  Zap,
} from 'lucide-react';

interface OnboardingViewProps {
  onComplete: (profileIds: string[]) => void;
  userName?: string;
}

export const OnboardingView: React.FC<OnboardingViewProps> = ({
  onComplete,
  userName = 'Friend',
}) => {
  const [selectedProfileIds, setSelectedProfileIds] = useState<string[]>([]);
  const [isPreparing, setIsPreparing] = useState<boolean>(false);

  // Helper to render dynamic icon based on iconName
  const renderIcon = (iconName: string, className: string = 'w-5 h-5') => {
    switch (iconName) {
      case 'GraduationCap':
        return <GraduationCap className={className} />;
      case 'Briefcase':
        return <Briefcase className={className} />;
      case 'Code':
        return <Code className={className} />;
      case 'Users':
        return <Users className={className} />;
      case 'Rocket':
        return <Rocket className={className} />;
      case 'Building2':
        return <Building2 className={className} />;
      case 'BookOpen':
        return <BookOpen className={className} />;
      case 'HeartPulse':
        return <HeartPulse className={className} />;
      case 'Palette':
        return <Palette className={className} />;
      case 'Home':
        return <Home className={className} />;
      case 'Sparkles':
      default:
        return <Sparkles className={className} />;
    }
  };

  const handleToggleProfile = (id: string) => {
    if (id === 'skip') {
      setSelectedProfileIds(['skip']);
      return;
    }

    setSelectedProfileIds((prev) => {
      const filtered = prev.filter((p) => p !== 'skip');
      if (filtered.includes(id)) {
        return filtered.filter((p) => p !== id);
      }
      if (filtered.length >= 3) {
        return filtered; // Max 3 profiles
      }
      return [...filtered, id];
    });
  };

  const handleContinue = () => {
    if (selectedProfileIds.length === 0) return;

    setIsPreparing(true);

    // 1.8 second loading screen animation before committing workspace setup
    setTimeout(() => {
      onComplete(selectedProfileIds);
    }, 1800);
  };

  const selectedTitles = selectedProfileIds
    .map((id) => PROFILE_OPTIONS.find((p) => p.id === id)?.title)
    .filter(Boolean);

  const displayTitles = selectedTitles.join(' & ') || 'Personalized';

  // STEP 2: Personalized Workspace Loading Screen
  if (isPreparing) {
    return (
      <div className="fixed inset-0 z-50 bg-[#0D1B2A] text-white flex flex-col items-center justify-center p-6 text-center select-none overflow-hidden">
        {/* Ambient Radial Background Glow */}
        <div className="absolute -inset-10 bg-gradient-to-tr from-blue-600/30 via-amber-500/20 to-indigo-600/30 rounded-full blur-3xl pointer-events-none animate-pulse" />

        <div className="relative z-10 max-w-sm flex flex-col items-center">
          {/* Logo with pulsating rings */}
          <div className="relative mb-8">
            <div className="absolute -inset-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl blur-md opacity-60 animate-pulse" />
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-[#0B132B] p-1.5 border border-amber-400/40 shadow-2xl flex items-center justify-center relative z-10">
              <SarthiLogo variant="icon-only" darkBg={true} />
            </div>
          </div>

          {/* Golden Sparkle badge */}
          <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-400/30 px-3.5 py-1 rounded-full text-amber-300 text-xs font-bold mb-4 shadow-sm animate-bounce">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span className="truncate max-w-[260px]">
              Configuring {displayTitles} Workspace
            </span>
          </div>

          {/* Loading Message */}
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-snug mb-3">
            SARTHI is preparing your personalized workspace...
          </h2>

          <p className="text-xs text-slate-300/80 mb-8 max-w-xs leading-relaxed">
            Generating tailored habits, tasks, daily planner & goals for{' '}
            <span className="text-white font-bold">{userName}</span>.
          </p>

          {/* Smooth Loading Bar */}
          <div className="w-full bg-slate-800/80 rounded-full h-2 border border-slate-700/60 overflow-hidden relative shadow-inner">
            <div className="h-full bg-gradient-to-r from-blue-500 via-amber-400 to-indigo-500 rounded-full w-full animate-[shimmer_1.8s_infinite] transition-all duration-1000" />
          </div>
        </div>
      </div>
    );
  }

  // STEP 1: Profile Selection Screen
  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-between p-4 sm:p-6 font-sans selection:bg-blue-600 selection:text-white">
      {/* Background Subtle Gradient Blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-30">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-600 rounded-full filter blur-[120px]" />
        <div className="absolute top-1/2 -right-40 w-96 h-96 bg-indigo-600 rounded-full filter blur-[120px]" />
      </div>

      <div className="w-full max-w-2xl my-auto py-6 space-y-6 relative z-10">
        {/* Top Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 bg-blue-500/10 border border-blue-400/20 px-3 py-1 rounded-full text-[11px] font-extrabold text-blue-300 uppercase tracking-widest">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            <span>Onboarding • Workspace Personalization</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Welcome to SARTHI 👋
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
            Tell us about yourself so we can personalize your workspace. (Select up to 3)
          </p>
        </div>

        {/* Profile Options Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[58vh] overflow-y-auto pr-1 custom-scrollbar">
          {PROFILE_OPTIONS.map((profile) => {
            const isSelected = selectedProfileIds.includes(profile.id);
            const isMaxReached =
              !isSelected &&
              selectedProfileIds.length >= 3 &&
              !selectedProfileIds.includes('skip');

            return (
              <button
                key={profile.id}
                type="button"
                disabled={isMaxReached}
                onClick={() => handleToggleProfile(profile.id)}
                className={`relative text-left p-3.5 rounded-2xl transition-all duration-200 cursor-pointer select-none group border flex items-start gap-3.5 ${
                  isSelected
                    ? 'bg-blue-600/20 border-blue-500 ring-2 ring-blue-500/50 shadow-lg shadow-blue-900/40 scale-[1.02]'
                    : isMaxReached
                    ? 'bg-slate-800/30 border-slate-800 opacity-50 cursor-not-allowed'
                    : 'bg-slate-800/60 border-slate-700/60 hover:bg-slate-800 hover:border-slate-600'
                }`}
              >
                {/* Profile Icon Badge */}
                <div
                  className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${profile.color} flex items-center justify-center text-white shrink-0 shadow-sm mt-0.5 group-hover:scale-105 transition-transform`}
                >
                  {renderIcon(profile.iconName, 'w-5 h-5 text-white')}
                </div>

                {/* Info Text */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1.5">
                    <h3 className="text-xs sm:text-sm font-extrabold text-white truncate flex items-center gap-1.5">
                      <span>{profile.emoji}</span>
                      <span>{profile.title}</span>
                    </h3>

                    {isSelected && (
                      <div className="w-5 h-5 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center shrink-0 shadow-sm border border-amber-300">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                    )}
                  </div>

                  <p className="text-[11px] text-slate-300/80 mt-1 line-clamp-2 leading-snug">
                    {profile.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Bottom CTA Bar */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-800/80">
          <p className="text-[11px] text-slate-400">
            {selectedProfileIds.length > 0 ? (
              <span className="text-blue-300 font-medium flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                Selected ({selectedProfileIds.includes('skip') ? 'Skip' : `${selectedProfileIds.length}/3`}):{' '}
                <strong className="text-white truncate max-w-[200px] inline-block align-bottom">
                  {selectedTitles.join(', ')}
                </strong>
              </span>
            ) : (
              <span>Select up to 3 profiles to auto-generate personalized starter data</span>
            )}
          </p>

          <button
            type="button"
            disabled={selectedProfileIds.length === 0}
            onClick={handleContinue}
            className={`w-full sm:w-auto px-6 py-3 rounded-xl font-black text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md ${
              selectedProfileIds.length > 0
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-blue-600/30 active:scale-95'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/50'
            }`}
          >
            <span>Continue</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
