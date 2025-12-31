import React, { useState, useEffect } from 'react';
import { useApp } from '../store';
import { connectLive, disconnectLive, LiveCallbacks } from '../services/gemini';
import { Mic, Zap } from 'lucide-react';

const ThinkTab: React.FC = () => {
  const { settings, refreshData } = useApp();
  const [sessionState, setSessionState] = useState<'idle' | 'listening' | 'speaking' | 'processing'>('idle');
  const [audioLevel, setAudioLevel] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const callbacks: LiveCallbacks = {
    onStateChange: (state) => setSessionState(state),
    onTranscript: (text) => {}, // Transcript managed silently in this UI
    onAudioLevel: (level) => {
      // Smooth visualizer
      setAudioLevel(prev => prev * 0.8 + level * 0.2);
    }
  };

  const toggleSession = async () => {
    if (sessionState === 'idle') {
      try {
        setError(null);
        await connectLive(settings, callbacks);
      } catch (e: any) {
        console.error(e);
        setError("Microphone access failed. Check permissions.");
      }
    } else {
      await disconnectLive();
      setSessionState('idle');
      refreshData(); // Refresh ideas if any were created
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnectLive();
    };
  }, []);

  // Visualizer scale
  const scale = 1 + Math.min(audioLevel * 5, 0.5);
  
  // Status Colors
  const ringColor = sessionState === 'listening' ? 'bg-blue-500' : 
                    sessionState === 'speaking' ? 'bg-green-500' :
                    sessionState === 'processing' ? 'bg-purple-500' : 'bg-zinc-800';
  
  const shadowColor = sessionState === 'listening' ? 'shadow-blue-500/50' : 
                      sessionState === 'speaking' ? 'shadow-green-500/50' :
                      sessionState === 'processing' ? 'shadow-purple-500/50' : 'shadow-zinc-900/50';

  return (
    <div className="flex flex-col items-center justify-center h-full p-6 relative">
      
      {/* Contextual Status */}
      <div className="absolute top-16 text-center transition-all duration-500">
        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-mono tracking-widest uppercase border ${sessionState === 'idle' ? 'border-zinc-800 bg-zinc-900/50 text-zinc-500' : 'border-blue-500/30 bg-blue-500/10 text-blue-400'}`}>
            <div className={`w-1.5 h-1.5 rounded-full ${sessionState === 'idle' ? 'bg-zinc-600' : 'bg-blue-400 animate-pulse'}`} />
            {sessionState === 'idle' ? 'Standby' : 'Active Uplink'}
        </div>
        
        <h1 className="text-4xl font-bold tracking-tight text-white mt-6 mb-2 drop-shadow-lg">
          {sessionState === 'idle' ? 'Tap to Think' : 
           sessionState === 'listening' ? 'Listening...' :
           sessionState === 'speaking' ? 'Speaking...' : 'Structuring...'}
        </h1>
        <p className="text-zinc-400 text-sm font-light">
           {sessionState === 'idle' ? 'Initialize your second brain.' : 
            'Neural interface connected.'}
        </p>
      </div>

      {/* Main Trigger Ring */}
      <div className="relative flex items-center justify-center w-80 h-80">
        {/* Animated Rings */}
        {sessionState !== 'idle' && (
           <>
            <div className={`absolute w-full h-full rounded-full opacity-10 animate-pulse-ring ${ringColor} blur-xl`} />
            <div className={`absolute w-64 h-64 rounded-full opacity-20 animate-pulse-ring ${ringColor} blur-md`} style={{ animationDelay: '0.5s' }} />
           </>
        )}
        
        {/* Core Button */}
        <button
          onClick={toggleSession}
          style={{ transform: `scale(${scale})` }}
          className={`relative z-10 flex items-center justify-center w-32 h-32 rounded-full transition-all duration-300 glass-panel border-4 ${
            sessionState === 'idle' ? 'border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800/80' : `${ringColor} border-transparent ${shadowColor} shadow-[0_0_50px_rgba(0,0,0,0.3)]`
          }`}
        >
          {sessionState === 'idle' ? (
            <Mic size={40} className="text-zinc-400" strokeWidth={1.5} />
          ) : sessionState === 'processing' ? (
            <Zap size={40} className="text-white animate-pulse" strokeWidth={2} />
          ) : (
            <div className="flex gap-1.5 h-8 items-center">
              <div className="w-1.5 bg-white h-4 animate-[bounce_1s_infinite]" style={{animationDelay: '0s'}}></div>
              <div className="w-1.5 bg-white h-8 animate-[bounce_1s_infinite]" style={{animationDelay: '0.1s'}}></div>
              <div className="w-1.5 bg-white h-4 animate-[bounce_1s_infinite]" style={{animationDelay: '0.2s'}}></div>
            </div>
          )}
        </button>
      </div>

      {/* Helper Hints */}
      <div className="absolute bottom-24 text-center space-y-3 opacity-60">
        <p className="text-[10px] text-zinc-500 uppercase tracking-[0.2em] font-bold">Suggestions</p>
        <div className="flex flex-wrap justify-center gap-2">
          {["Save this thought", "What relates to this?", "Summarize timeline"].map((cmd) => (
             <span key={cmd} className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-full text-[10px] text-zinc-300 font-medium backdrop-blur-sm">
               "{cmd}"
             </span>
          ))}
        </div>
      </div>

      {error && (
        <div className="absolute top-4 bg-red-500/10 backdrop-blur-md text-red-200 px-4 py-2 rounded-lg text-sm border border-red-500/20 shadow-lg">
          {error}
        </div>
      )}
    </div>
  );
};

export default ThinkTab;