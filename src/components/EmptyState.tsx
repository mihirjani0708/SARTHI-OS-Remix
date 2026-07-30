import React from 'react';
import { SarthiLogo } from './SarthiLogo';
import { Sparkles, Plus } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
  category?: 'planner' | 'habits' | 'goals' | 'journal' | 'general';
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  actionLabel,
  onAction,
  icon,
}) => {
  return (
    <div className="bg-gradient-to-b from-blue-50/50 via-white to-slate-50/80 rounded-3xl p-8 sm:p-10 border border-blue-100/80 shadow-xs text-center flex flex-col items-center justify-center my-4 animate-fadeIn">
      {/* Branded Illustration with SARTHI Emblem & Shimmer Star */}
      <div className="relative mb-5 group">
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-[#1E3A8A] to-[#2563EB] p-3 shadow-lg shadow-blue-900/15 ring-4 ring-blue-100 flex items-center justify-center relative overflow-hidden group-hover:scale-105 transition-transform duration-300">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(245,181,10,0.35),transparent_60%)]" />
          {icon ? (
            <div className="text-white relative z-10 drop-shadow-md">{icon}</div>
          ) : (
            <SarthiLogo variant="icon-only" size="lg" />
          )}
        </div>
        <div className="absolute -bottom-1 -right-1 bg-[#F5B50A] text-slate-900 rounded-full p-1 shadow-sm">
          <Sparkles className="w-3.5 h-3.5" />
        </div>
      </div>

      <h3 className="text-base sm:text-lg font-extrabold text-gray-900 tracking-tight max-w-sm">
        {title}
      </h3>
      <p className="text-xs sm:text-sm font-medium text-gray-500 mt-1.5 max-w-md leading-relaxed">
        {description}
      </p>

      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="mt-5 inline-flex items-center justify-center gap-2 bg-[#1E3A8A] hover:bg-[#2563EB] text-white text-xs font-bold px-5 py-2.5 sm:py-3 rounded-xl shadow-md shadow-blue-900/15 hover:shadow-lg transition-all cursor-pointer active:scale-95 min-h-[44px]"
        >
          <Plus className="w-4 h-4 text-[#F5B50A]" />
          <span>{actionLabel}</span>
        </button>
      )}
    </div>
  );
};
