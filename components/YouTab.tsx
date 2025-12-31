import React from 'react';
import { useApp } from '../store';
import { VOICE_PRESETS } from '../constants';
import { VoicePresetName } from '../types';
import { Volume2, Mic, Activity, Trash, Download } from 'lucide-react';
import * as DB from '../services/db';

const YouTab: React.FC = () => {
  const { settings, updateSettings, ideas, refreshData } = useApp();

  const handleVoiceChange = (preset: VoicePresetName) => {
    updateSettings({ ...settings, voicePreset: preset });
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
    <div className="h-full overflow-y-auto p-6 pb-24 text-zinc-200">
      <h2 className="text-2xl font-bold text-white mb-6">Settings & Studio</h2>

      <section className="mb-8">
        <h3 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider mb-4 flex items-center gap-2">
          <Volume2 size={16} /> Voice Personality
        </h3>
        
        <div className="grid grid-cols-1 gap-3">
          {(Object.keys(VOICE_PRESETS) as VoicePresetName[]).map((preset) => (
            <button
              key={preset}
              onClick={() => handleVoiceChange(preset)}
              className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                settings.voicePreset === preset 
                  ? 'bg-blue-900/20 border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.2)]' 
                  : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700'
              }`}
            >
              <div className="text-left">
                <div className={`font-medium ${settings.voicePreset === preset ? 'text-blue-400' : 'text-zinc-300'}`}>
                  {preset}
                </div>
                <div className="text-xs text-zinc-500 mt-1">
                  {VOICE_PRESETS[preset].systemPromptModifier.substring(0, 50)}...
                </div>
              </div>
              {settings.voicePreset === preset && (
                <div className="h-3 w-3 rounded-full bg-blue-500 shadow-[0_0_10px_#3b82f6]"></div>
              )}
            </button>
          ))}
        </div>
      </section>

      <section className="mb-8">
        <h3 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider mb-4 flex items-center gap-2">
          <Activity size={16} /> Behavior
        </h3>
        <div className="bg-zinc-900 rounded-xl p-4 border border-zinc-800 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">Hands-free Mode</span>
              <div className={`w-10 h-5 rounded-full flex items-center px-1 cursor-pointer transition-colors ${settings.handsFree ? 'bg-blue-600' : 'bg-zinc-700'}`} onClick={() => updateSettings({...settings, handsFree: !settings.handsFree})}>
                <div className={`w-3 h-3 bg-white rounded-full transition-transform ${settings.handsFree ? 'translate-x-5' : ''}`}></div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Auto-End Turn</span>
              <div className={`w-10 h-5 rounded-full flex items-center px-1 cursor-pointer transition-colors ${settings.autoEndTurn ? 'bg-blue-600' : 'bg-zinc-700'}`} onClick={() => updateSettings({...settings, autoEndTurn: !settings.autoEndTurn})}>
                <div className={`w-3 h-3 bg-white rounded-full transition-transform ${settings.autoEndTurn ? 'translate-x-5' : ''}`}></div>
              </div>
            </div>
        </div>
      </section>

      <section>
        <h3 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider mb-4 flex items-center gap-2">
          Data
        </h3>
        <div className="space-y-3">
          <button onClick={exportData} className="w-full flex items-center justify-center gap-2 p-3 rounded-lg bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-300 text-sm">
            <Download size={16} /> Export Brain (JSON)
          </button>
          <button onClick={clearMemory} className="w-full flex items-center justify-center gap-2 p-3 rounded-lg bg-red-900/20 border border-red-900/50 hover:bg-red-900/30 text-red-400 text-sm">
            <Trash size={16} /> Delete All Memory
          </button>
        </div>
      </section>
      
      <div className="mt-12 text-center text-xs text-zinc-700">
        Second Voice v1.0.0<br/>
        Powered by Gemini Live API
      </div>
    </div>
  );
};

export default YouTab;
