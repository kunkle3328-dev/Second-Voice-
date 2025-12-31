import React from 'react';
import { useApp } from '../store';
import { Circle, Minus } from 'lucide-react';

const TimelineTab: React.FC = () => {
  const { ideas } = useApp();
  
  // Sort by date desc
  const sortedIdeas = [...ideas].sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  const getRelativeTime = (isoString: string) => {
    const date = new Date(isoString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days} days ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="h-full overflow-y-auto p-6 pb-24">
      <h2 className="text-2xl font-bold text-white mb-8">Timeline</h2>
      
      <div className="relative border-l border-zinc-800 ml-3 space-y-8">
        {sortedIdeas.map((idea) => (
          <div key={idea.id} className="relative pl-8">
            {/* Dot */}
            <div className="absolute -left-[5px] top-1.5 bg-zinc-950">
              <Circle size={10} className="text-blue-500 fill-blue-500" />
            </div>
            
            {/* Content */}
            <div className="flex flex-col gap-1">
               <span className="text-xs font-mono text-zinc-500 uppercase tracking-wide">
                 {getRelativeTime(idea.created_at)} &bull; {new Date(idea.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
               </span>
               <h3 className="text-lg font-medium text-zinc-200">{idea.title}</h3>
               <p className="text-sm text-zinc-500 line-clamp-2">{idea.summary}</p>
            </div>
          </div>
        ))}

        {sortedIdeas.length === 0 && (
          <div className="pl-8 text-zinc-600">
            No history yet. Start thinking out loud.
          </div>
        )}
      </div>
    </div>
  );
};

export default TimelineTab;
