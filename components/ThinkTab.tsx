import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../store';
import { connectLive, disconnectLive, LiveCallbacks } from '../services/gemini';
import { Mic, MicOff, Zap } from 'lucide-react';

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
  const ringColor = sessionState === 'listening' ? 'bg-blue-500' : 
                    sessionState === 'speaking' ? 'bg-green-500' :
                    sessionState === 'processing' ? 'bg-purple-500' : 'bg-zinc-700';

  return (
    <div className="flex flex-col items-center justify-center h-full p-6 relative">
      
      {/* Contextual Status */}
      <div className="absolute top-12 text-center transition-opacity duration-300">
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">
          {sessionState === 'idle' ? 'Tap to Think' : 
           sessionState === 'listening' ? 'Listening...' :
           sessionState === 'speaking' ? 'Speaking...' : 'Structuring...'}
        </h1>
        <p className="text-zinc-400 text-sm">
           {sessionState === 'idle' ? 'Your second brain is ready.' : 
            'Conversational memory active.'}
        </p>
      </div>

      {/* Main Trigger Ring */}
      <div className="relative flex items-center justify-center w-64 h-64">
        {/* Animated Rings */}
        {sessionState !== 'idle' && (
           <>
            <div className={`absolute w-full h-full rounded-full opacity-20 animate-pulse-ring ${ringColor}`} />
            <div className={`absolute w-48 h-48 rounded-full opacity-30 animate-pulse-ring ${ringColor}`} style={{ animationDelay: '0.5s' }} />
           </>
        )}
        
        {/* Core Button */}
        <button
          onClick={toggleSession}
          style={{ transform: `scale(${scale})` }}
          className={`relative z-10 flex items-center justify-center w-32 h-32 rounded-full shadow-2xl transition-all duration-300 ${
            sessionState === 'idle' ? 'bg-zinc-800 hover:bg-zinc-700 border-4 border-zinc-700' : ringColor
          }`}
        >
          {sessionState === 'idle' ? (
            <Mic size={48} className="text-white" />
          ) : sessionState === 'processing' ? (
            <Zap size={48} className="text-white animate-pulse" />
          ) : (
            <div className="flex gap-1 h-8 items-center">
              <div className="w-1.5 bg-white h-4 animate-bounce" style={{animationDelay: '0s'}}></div>
              <div className="w-1.5 bg-white h-8 animate-bounce" style={{animationDelay: '0.1s'}}></div>
              <div className="w-1.5 bg-white h-4 animate-bounce" style={{animationDelay: '0.2s'}}></div>
            </div>
          )}
        </button>
      </div>

      {/* Helper Hints */}
      <div className="absolute bottom-12 text-center space-y-2 opacity-60">
        <p className="text-xs text-zinc-500 uppercase tracking-widest font-semibold">Commands</p>
        <div className="flex flex-wrap justify-center gap-2 text-xs text-zinc-400">
          <span className="px-2 py-1 bg-zinc-900 rounded-full border border-zinc-800">"Save this"</span>
          <span className="px-2 py-1 bg-zinc-900 rounded-full border border-zinc-800">"What relates to this?"</span>
          <span className="px-2 py-1 bg-zinc-900 rounded-full border border-zinc-800">"Summarize"</span>
        </div>
      </div>

      {error && (
        <div className="absolute top-4 bg-red-900/50 text-red-200 px-4 py-2 rounded-lg text-sm border border-red-800">
          {error}
        </div>
      )}
    </div>
  );
};

export default ThinkTab;
