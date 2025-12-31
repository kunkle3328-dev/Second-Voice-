import React from 'react';
import { useApp } from '../store';
import { Trash2 } from 'lucide-react';
import * as DB from '../services/db';

const IdeasTab: React.FC = () => {
  const { ideas, refreshData } = useApp();

  const handleDelete = (id: string) => {
    if (confirm("Forget this idea?")) {
      DB.deleteIdea(id);
      refreshData();
    }
  };

  if (ideas.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-zinc-500 p-8 text-center">
        <div className="mb-6 p-6 rounded-full bg-zinc-900/50 border border-zinc-800">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-zinc-600">
            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
          </svg>
        </div>
        <p className="text-lg font-medium text-zinc-400">Neural Memory Empty</p>
        <p className="text-xs text-zinc-600 mt-2 uppercase tracking-wide">Initiate a session in the Think tab</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-4 space-y-4 pb-24 no-scrollbar">
      <header className="flex justify-between items-baseline mb-6 px-2">
        <div>
           <h2 className="text-2xl font-bold text-white tracking-tight">Memory</h2>
           <p className="text-xs text-zinc-500 font-mono mt-1">TOTAL NODES: {ideas.length}</p>
        </div>
      </header>
      
      {ideas.map((idea) => (
        <div key={idea.id} className="glass-panel rounded-2xl p-5 hover:bg-white/5 transition-colors group">
          <div className="flex justify-between items-start mb-3">
            <h3 className="font-semibold text-zinc-100 text-lg leading-tight tracking-tight">{idea.title}</h3>
            <span className="text-[10px] text-zinc-600 font-mono whitespace-nowrap bg-zinc-900/50 px-2 py-1 rounded">
              {new Date(idea.created_at).toLocaleDateString()}
            </span>
          </div>
          <p className="text-zinc-400 text-sm mb-5 leading-relaxed font-light">
            {idea.summary}
          </p>
          
          <div className="flex justify-between items-center pt-3 border-t border-white/5">
            <div className="flex gap-2">
              {idea.tags.map(tag => (
                <span key={tag} className="text-[10px] bg-blue-500/10 border border-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full font-medium">
                  #{tag}
                </span>
              ))}
            </div>
            
            <button 
              onClick={() => handleDelete(idea.id)}
              className="text-zinc-600 hover:text-red-400 p-2 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default IdeasTab;