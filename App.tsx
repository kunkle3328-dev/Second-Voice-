import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './store';
import { Mic, Lightbulb, Share2, Clock, User, Sparkles } from 'lucide-react';

import ThinkTab from './components/ThinkTab';
import IdeasTab from './components/IdeasTab';
import LinksTab from './components/LinksTab';
import TimelineTab from './components/TimelineTab';
import YouTab from './components/YouTab';

const NavItem = ({ tab, icon: Icon, label }: { tab: any, icon: any, label: string }) => {
  const { activeTab, setActiveTab } = useApp();
  const isActive = activeTab === tab;
  return (
    <button
      onClick={() => setActiveTab(tab)}
      className={`relative flex flex-col items-center justify-center w-full h-full space-y-1 transition-all duration-300 ${
        isActive ? 'text-blue-400' : 'text-zinc-500 hover:text-zinc-300'
      }`}
    >
      <div className={`absolute -top-3 w-8 h-1 rounded-b-full bg-blue-500/50 blur-[2px] transition-all duration-300 ${isActive ? 'opacity-100' : 'opacity-0'}`} />
      <Icon size={22} strokeWidth={isActive ? 2.5 : 1.5} className={`transition-transform duration-300 ${isActive ? 'scale-110 drop-shadow-[0_0_8px_rgba(96,165,250,0.5)]' : ''}`} />
      <span className="text-[10px] font-medium tracking-wide">{label}</span>
    </button>
  );
};

const MainContent = () => {
  const { activeTab } = useApp();

  return (
    <div className="flex-1 overflow-hidden relative bg-zinc-950 text-white">
      {/* Background ambient gradients */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-20%] w-[500px] h-[500px] bg-blue-900/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-20%] w-[500px] h-[500px] bg-purple-900/10 rounded-full blur-[100px]" />
      </div>
      
      <div className="relative z-10 h-full">
        {activeTab === 'think' && <ThinkTab />}
        {activeTab === 'ideas' && <IdeasTab />}
        {activeTab === 'links' && <LinksTab />}
        {activeTab === 'timeline' && <TimelineTab />}
        {activeTab === 'you' && <YouTab />}
      </div>
    </div>
  );
};

const SplashScreen = ({ onFinish }: { onFinish: () => void }) => {
  const [progress, setProgress] = useState(0);
  const [text, setText] = useState("INITIALIZING");
  const [subtext, setSubtext] = useState("Loading Neural Core...");
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    // Sequence
    const steps = [
      { p: 5, t: "SYSTEM BOOT", s: "Powering up neural interfaces..." },
      { p: 25, t: "AUTHENTICATING", s: "Verifying biometric voiceprint..." },
      { p: 45, t: "CONNECTING", s: "Establishing secure uplink to Gemini v2.5..." },
      { p: 65, t: "SYNCING", s: "Structuring local memory graph..." },
      { p: 85, t: "CALIBRATING", s: "Fine-tuning audio processing engine..." },
      { p: 100, t: "ONLINE", s: "Second Voice active." }
    ];
    
    let step = 0;
    const interval = setInterval(() => {
      if (step >= steps.length) {
        clearInterval(interval);
        setTimeout(() => setIsFading(true), 400);
        setTimeout(onFinish, 1200); 
        return;
      }
      setProgress(steps[step].p);
      setText(steps[step].t);
      setSubtext(steps[step].s);
      step++;
    }, 600); 

    return () => clearInterval(interval);
  }, [onFinish]);
  
  return (
    <div className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#050507] text-white overflow-hidden transition-all duration-1000 ${isFading ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100 scale-100'}`}>
        
        {/* Animated Background Mesh */}
        <div className="absolute inset-0 z-0 opacity-30">
            <div className="absolute top-[20%] left-[20%] w-96 h-96 bg-blue-600/20 rounded-full blur-[128px] animate-pulse" style={{animationDuration: '4s'}} />
            <div className="absolute bottom-[20%] right-[20%] w-96 h-96 bg-purple-600/20 rounded-full blur-[128px] animate-pulse" style={{animationDelay: '1s', animationDuration: '5s'}} />
        </div>

        {/* Glass Card */}
        <div className="relative z-10 w-[340px] glass-panel rounded-3xl p-8 flex flex-col items-center border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
            
            {/* Holographic Icon */}
            <div className="mb-10 relative group">
                <div className="absolute inset-0 bg-blue-500/30 rounded-full blur-xl group-hover:blur-2xl transition-all duration-500" />
                <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-zinc-800 to-black border border-white/10 flex items-center justify-center shadow-2xl">
                    <Sparkles className="w-8 h-8 text-blue-400 animate-pulse" />
                </div>
                {/* Spinning Ring */}
                <div className="absolute -inset-1 rounded-full border border-blue-500/30 border-t-blue-500/80 animate-spin" style={{animationDuration: '3s'}} />
            </div>

            <h1 className="text-3xl font-bold tracking-tighter mb-2 text-center bg-clip-text text-transparent bg-gradient-to-r from-white via-zinc-200 to-zinc-500">
                Second Voice
            </h1>
            
            <div className="flex items-center gap-2 mb-8">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <p className="text-[10px] text-zinc-500 font-mono tracking-[0.2em] uppercase">System v1.0.0</p>
            </div>

            {/* Futuristic Progress Bar */}
            <div className="w-full h-1 bg-zinc-800 rounded-full mb-6 relative overflow-hidden">
                 <div 
                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-600 to-cyan-400 transition-all duration-500 ease-out shadow-[0_0_15px_rgba(59,130,246,0.8)]"
                    style={{ width: `${progress}%` }}
                 />
                 {/* Scanner Line */}
                 <div className="absolute top-0 bottom-0 w-20 bg-white/20 skew-x-[-20deg] animate-[shimmer_2s_infinite] translate-x-[-100%]" />
            </div>

            <div className="h-12 flex flex-col items-center justify-center space-y-1">
              <p className="text-sm font-bold text-zinc-200 tracking-widest animate-pulse transition-all duration-300">
                  {text}
              </p>
              <p className="text-[10px] text-zinc-500 font-mono text-center transition-all duration-300">
                  {subtext}
              </p>
            </div>
        </div>
    </div>
  );
};

const AppShell = () => {
  return (
    <div className="flex flex-col h-[100dvh] w-full bg-zinc-950">
      <MainContent />
      
      {/* Bottom Navigation Glass */}
      <div className="h-20 glass-panel border-t-0 border-t border-white/5 flex items-center justify-around pb-4 px-2 shrink-0 z-50 backdrop-blur-xl bg-zinc-950/70">
        <NavItem tab="think" icon={Mic} label="Think" />
        <NavItem tab="ideas" icon={Lightbulb} label="Ideas" />
        <NavItem tab="links" icon={Share2} label="Links" />
        <NavItem tab="timeline" icon={Clock} label="Timeline" />
        <NavItem tab="you" icon={User} label="You" />
      </div>
    </div>
  );
};

const App = () => {
  const [loading, setLoading] = useState(true);

  return (
    <AppProvider>
      {loading && <SplashScreen onFinish={() => setLoading(false)} />}
      {!loading && <AppShell />}
    </AppProvider>
  );
};

export default App;