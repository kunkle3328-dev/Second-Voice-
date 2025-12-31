import React from 'react';
import { AppProvider, useApp } from './store';
import { Mic, Lightbulb, Share2, Clock, User } from 'lucide-react';

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
      className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${
        isActive ? 'text-blue-400' : 'text-zinc-500'
      }`}
    >
      <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
      <span className="text-[10px] font-medium">{label}</span>
    </button>
  );
};

const MainContent = () => {
  const { activeTab } = useApp();

  return (
    <div className="flex-1 overflow-hidden relative bg-zinc-950 text-white">
      {activeTab === 'think' && <ThinkTab />}
      {activeTab === 'ideas' && <IdeasTab />}
      {activeTab === 'links' && <LinksTab />}
      {activeTab === 'timeline' && <TimelineTab />}
      {activeTab === 'you' && <YouTab />}
    </div>
  );
};

const AppShell = () => {
  return (
    <div className="flex flex-col h-[100dvh] w-full bg-zinc-950">
      <MainContent />
      
      {/* Bottom Navigation */}
      <div className="h-20 bg-zinc-900 border-t border-zinc-800 flex items-center justify-around pb-4 px-2 shrink-0 z-50">
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
  return (
    <AppProvider>
      <AppShell />
    </AppProvider>
  );
};

export default App;
