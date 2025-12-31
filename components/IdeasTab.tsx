import React from 'react';
import { useApp } from '../store';
import { Trash2, Link as LinkIcon, Calendar } from 'lucide-react';
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
        <div className="mb-4 text-zinc-700">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
          </svg>
        </div>
        <p>No ideas yet.</p>
        <p className="text-sm mt-2">Go to the Think tab and say "Save this as an idea..."</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-4 space-y-4 pb-24">
      <header className="flex justify-between items-baseline mb-6">
        <h2 className="text-2xl font-bold text-white">Memory</h2>
        <span className="text-sm text-zinc-500">{ideas.length} thoughts</span>
      </header>
      
      {ideas.map((idea) => (
        <div key={idea.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 shadow-sm hover:border-zinc-700 transition-colors">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-semibold text-zinc-100 text-lg leading-tight">{idea.title}</h3>
            <span className="text-xs text-zinc-600 font-mono whitespace-nowrap">
              {new Date(idea.created_at).toLocaleDateString()}
            </span>
          </div>
          <p className="text-zinc-400 text-sm mb-4 leading-relaxed">
            {idea.summary}
          </p>
          
          <div className="flex justify-between items-center pt-2 border-t border-zinc-800/50">
            <div className="flex gap-2">
              {idea.tags.map(tag => (
                <span key={tag} className="text-xs bg-zinc-800 text-zinc-400 px-2 py-1 rounded-full">
                  #{tag}
                </span>
              ))}
            </div>
            
            <button 
              onClick={() => handleDelete(idea.id)}
              className="text-zinc-600 hover:text-red-400 p-2"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default IdeasTab;
