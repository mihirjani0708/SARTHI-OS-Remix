import React from 'react';

interface ListeningAnimationProps {
  state: 'idle' | 'listening' | 'processing';
  className?: string;
}

export const ListeningAnimation: React.FC<ListeningAnimationProps> = ({ state, className = '' }) => {
  if (state === 'idle') return null;

  if (state === 'processing') {
    return (
      <div className={`flex items-center gap-1 px-2 py-1 ${className}`}>
        <div className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
        <div className="w-2 h-2 rounded-full bg-blue-400 animate-ping [animation-delay:200ms]" />
        <div className="w-2 h-2 rounded-full bg-indigo-400 animate-ping [animation-delay:400ms]" />
      </div>
    );
  }

  // Active Listening Waveform
  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <span className="w-1 bg-amber-400 rounded-full h-3 animate-bounce [animation-delay:0ms]" />
      <span className="w-1 bg-blue-400 rounded-full h-5 animate-bounce [animation-delay:150ms]" />
      <span className="w-1 bg-white rounded-full h-3.5 animate-bounce [animation-delay:300ms]" />
      <span className="w-1 bg-blue-300 rounded-full h-6 animate-bounce [animation-delay:450ms]" />
      <span className="w-1 bg-amber-300 rounded-full h-2.5 animate-bounce [animation-delay:600ms]" />
    </div>
  );
};
