import React from 'react';
import { useApp } from '../store';
import { VOICE_PRESETS } from '../constants';
import { VoicePresetName, VoiceDetails } from '../types';
import { Volume2, Activity, Trash, Download, Settings2, Info } from 'lucide-react';
import * as DB from '../services/db';

const TOOLTIP_DESCRIPTIONS: Record<keyof VoiceDetails, string> = {
  pace: "Controls the speed of speech. Lower values are slower and more deliberate; higher values are conversational and quick.",
  pauseDensity: "Determines how frequently the model pauses. High values create a thoughtful, reflective cadence.",
  emphasis: "Adjusts the dynamic range of pitch and volume to create more expressive or flatter speech.",
  warmth: "Modulates the emotional temperature. High warmth sounds empathetic; low warmth sounds objective.",
  breathiness: "Adds air to the voice signal. Useful for creating a closer, more intimate, or softer texture.",
  disfluency: "Injects natural human imperfections like 'umm' and 'uhh' to make the voice sound less robotic."
};

const Tooltip = ({ text }: { text: string }) => (
  <div className="group relative inline-flex items-center justify-center ml-1.5 cursor-help">
    <Info size={12} className="text-zinc-600 group-hover:text-blue-400 transition-colors" />
    <div className="tooltip-content invisible opacity-0 absolute bottom-full mb-2 w-48 p-2 bg-zinc-900 border border-zinc-700 rounded-lg shadow-xl text-[10px] text-zinc-300 leading-relaxed z-50 transition-all duration-200 transform translate-y-2 pointer-events-none group-hover:visible group-hover:opacity-100 group-hover:translate-y-0">
      {text}
      <div className="absolute bottom-[-4px] left-1/2 -translate-x-1/2 w-2 h-2 bg-zinc-900 border-b border-r border-zinc-700 rotate-45"></div>
    </div>
  </div>
);

const SliderControl = ({ label, value, tooltip, onChange }: { label: string; value: number; tooltip: string; onChange: (v: number) => void }) => (
  <div className="flex flex-col gap-2">
    <div className="flex justify-between items-center">
      <div className="flex items-center text-xs font-medium text-zinc-300">
        {label}
        <Tooltip text={tooltip} />
      </div>
      <span className="font-mono text-[10px] text-blue-400 bg-blue-400/10 px-1.5 rounded">{(value * 100).toFixed(0)}%</span>
    </div>
    <div className="relative h-6 flex items-center">
      <input
        type="range"
        min="0"
        max="1"
        step="0.05"
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-1.5 bg-zinc-800 rounded-full appearance-none cursor-pointer accent-blue-500 hover:accent-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
      />
    </div>
  </div>
);

const YouTab: React.FC = () => {
  const { settings, updateSettings, refreshData } = useApp();

  const handleVoiceChange = (preset: VoicePresetName) => {
    updateSettings({ 
      ...settings, 
      voicePreset: preset,
      voiceDetails: VOICE_PRESETS[preset].defaultDetails 
    });
  };

  const handleDetailChange = (key: keyof VoiceDetails, val: number) => {
    updateSettings({
      ...settings,
      voiceDetails: {
        ...settings.voiceDetails,
        [key]: val
      }
    });
  };

  const clearMemory = () => {
    if (confirm("ARE YOU SURE? This will delete all your thoughts and links permanently.")) {
      DB.clearAllData();
      refreshData();
      alert("Second brain wiped.");
    }
  };

  const exportData = () => {
    const data = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(DB.getIdeas(), null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", data);
    downloadAnchorNode.setAttribute("download", "second_voice_backup.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  return (
    <div className="h-full overflow-y-auto p-6 pb-32 text-zinc-200 no-scrollbar">
      <header className="mb-8">
        <h2 className="text-2xl font-bold text-white tracking-tight">Studio</h2>
        <p className="text-sm text-zinc-500">Customize your neural interface.</p>
      </header>

      <section className="mb-8">
        <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4 flex items-center gap-2">
          <Volume2 size={14} /> Voice Personality
        </h3>
        
        {/* Presets Grid */}
        <div className="grid grid-cols-1 gap-3 mb-6">
          {(Object.keys(VOICE_PRESETS) as VoicePresetName[]).map((preset) => (
            <button
              key={preset}
              onClick={() => handleVoiceChange(preset)}
              className={`glass-button relative overflow-hidden flex items-start p-4 rounded-2xl text-left group transition-all duration-300 ${
                settings.voicePreset === preset 
                  ? 'border-blue-500/50 bg-blue-500/10 shadow-[0_0_20px_rgba(59,130,246,0.15)]' 
                  : 'border-white/5 hover:border-white/10'
              }`}
            >
              <div className="flex-1 z-10">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`font-semibold text-sm ${settings.voicePreset === preset ? 'text-blue-400' : 'text-zinc-200'}`}>
                    {preset}
                  </span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono uppercase tracking-wide border ${
                     settings.voicePreset === preset 
                     ? 'bg-blue-500/20 border-blue-500/30 text-blue-300' 
                     : 'bg-zinc-800 border-zinc-700 text-zinc-500'
                  }`}>
                    {VOICE_PRESETS[preset].voiceName}
                  </span>
                </div>
                <div className="text-xs text-zinc-500 leading-relaxed group-hover:text-zinc-400 transition-colors">
                  {VOICE_PRESETS[preset].description}
                </div>
              </div>
              
              {settings.voicePreset === preset && (
                <div className="absolute top-4 right-4 z-10">
                   <div className="w-2 h-2 rounded-full bg-blue-400 shadow-[0_0_10px_#60a5fa] animate-pulse"></div>
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Sliders Container */}
        <div className="glass-panel rounded-2xl p-6 space-y-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
            <Settings2 size={120} />
          </div>
          
          <div className="relative z-10">
             <div className="flex items-center gap-2 text-xs font-bold text-zinc-400 uppercase tracking-widest mb-6">
               <Settings2 size={14} /> Fine-tune Characteristics
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
               <SliderControl label="Pace" tooltip={TOOLTIP_DESCRIPTIONS.pace} value={settings.voiceDetails.pace} onChange={(v) => handleDetailChange('pace', v)} />
               <SliderControl label="Pause Density" tooltip={TOOLTIP_DESCRIPTIONS.pauseDensity} value={settings.voiceDetails.pauseDensity} onChange={(v) => handleDetailChange('pauseDensity', v)} />
               <SliderControl label="Emphasis" tooltip={TOOLTIP_DESCRIPTIONS.emphasis} value={settings.voiceDetails.emphasis} onChange={(v) => handleDetailChange('emphasis', v)} />
               <SliderControl label="Warmth" tooltip={TOOLTIP_DESCRIPTIONS.warmth} value={settings.voiceDetails.warmth} onChange={(v) => handleDetailChange('warmth', v)} />
               <SliderControl label="Breathiness" tooltip={TOOLTIP_DESCRIPTIONS.breathiness} value={settings.voiceDetails.breathiness} onChange={(v) => handleDetailChange('breathiness', v)} />
               <SliderControl label="Disfluency" tooltip={TOOLTIP_DESCRIPTIONS.disfluency} value={settings.voiceDetails.disfluency} onChange={(v) => handleDetailChange('disfluency', v)} />
             </div>
          </div>
        </div>
      </section>

      <section className="mb-8">
        <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4 flex items-center gap-2">
          <Activity size={14} /> Behavior
        </h3>
        <div className="glass-panel rounded-2xl p-1 border border-white/5 space-y-1">
            <div className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors">
              <span className="text-sm font-medium">Hands-free Mode</span>
              <div className={`w-11 h-6 rounded-full flex items-center px-1 cursor-pointer transition-all duration-300 ${settings.handsFree ? 'bg-blue-600 shadow-[0_0_15px_rgba(37,99,235,0.4)]' : 'bg-zinc-800'}`} onClick={() => updateSettings({...settings, handsFree: !settings.handsFree})}>
                <div className={`w-4 h-4 bg-white rounded-full shadow-md transition-transform duration-300 ${settings.handsFree ? 'translate-x-5' : ''}`}></div>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors">
              <span className="text-sm font-medium">Barge-in Mode</span>
              <div className={`w-11 h-6 rounded-full flex items-center px-1 cursor-pointer transition-all duration-300 ${settings.bargeIn ? 'bg-blue-600 shadow-[0_0_15px_rgba(37,99,235,0.4)]' : 'bg-zinc-800'}`} onClick={() => updateSettings({...settings, bargeIn: !settings.bargeIn})}>
                <div className={`w-4 h-4 bg-white rounded-full shadow-md transition-transform duration-300 ${settings.bargeIn ? 'translate-x-5' : ''}`}></div>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors">
              <span className="text-sm font-medium">Auto-End Turn</span>
              <div className={`w-11 h-6 rounded-full flex items-center px-1 cursor-pointer transition-all duration-300 ${settings.autoEndTurn ? 'bg-blue-600 shadow-[0_0_15px_rgba(37,99,235,0.4)]' : 'bg-zinc-800'}`} onClick={() => updateSettings({...settings, autoEndTurn: !settings.autoEndTurn})}>
                <div className={`w-4 h-4 bg-white rounded-full shadow-md transition-transform duration-300 ${settings.autoEndTurn ? 'translate-x-5' : ''}`}></div>
              </div>
            </div>
        </div>
      </section>

      <section>
        <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4 flex items-center gap-2">
          Data Protocol
        </h3>
        <div className="space-y-3">
          <button onClick={exportData} className="glass-button w-full flex items-center justify-center gap-2 p-3 rounded-xl text-zinc-300 text-sm font-medium hover:text-white">
            <Download size={16} /> Export Neural Graph (JSON)
          </button>
          <button onClick={clearMemory} className="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 text-red-400 text-sm font-medium transition-colors">
            <Trash size={16} /> Wipe Memory
          </button>
        </div>
      </section>
      
      <div className="mt-12 text-center text-[10px] text-zinc-600 font-mono uppercase tracking-widest">
        Second Voice v1.0.0<br/>
        Gemini Live API
      </div>
    </div>
  );
};

export default YouTab;