
import React from 'react';
import { PotteryEntry } from '../types';
import { getStageColor } from '../constants';

interface PotteryCardProps {
  entry: PotteryEntry;
  compact?: boolean;
  onClick?: () => void;
}

const PotteryCard: React.FC<PotteryCardProps> = ({ entry, compact = false, onClick }) => {
  const dateStr = new Date(entry.timestamp).toLocaleDateString('zh-CN', {
    month: 'short',
    day: 'numeric'
  });

  const coverImage = entry.images?.[0] || 'https://via.placeholder.com/400?text=No+Image';

  if (compact) {
    return (
      <div 
        onClick={onClick}
        className="min-w-[140px] flex flex-col gap-2 p-2 bg-warm-surface border border-stone-200 rounded-2xl shadow-sm shrink-0 cursor-pointer active:scale-95 transition-all"
      >
        <div 
          className="w-full aspect-square rounded-xl bg-cover bg-center" 
          style={{ backgroundImage: `url(${coverImage})` }}
        />
        <div className="px-1 flex flex-col gap-0.5">
          <p className="text-[12px] font-bold truncate text-stone-text">{entry.title}</p>
          <div className="flex justify-between items-center">
             <span className="text-[9px] text-stone-300 font-bold">{dateStr}</span>
             <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 bg-stone-50 rounded ${getStageColor(entry.stage)}`}>{entry.stage}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="group flex flex-col gap-1.5 cursor-pointer" onClick={onClick}>
      <div className="aspect-square bg-warm-surface rounded-[1.5rem] overflow-hidden relative border border-stone-100 shadow-sm">
        <div 
          className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110" 
          style={{ backgroundImage: `url(${coverImage})` }}
        />
        <div className="absolute bottom-2 left-2">
            <span className={`text-[8px] font-black px-2 py-1 bg-white/90 backdrop-blur shadow-sm rounded-lg ${getStageColor(entry.stage)}`}>{entry.stage}</span>
        </div>
      </div>
      <div className="px-1">
        <p className="text-[12px] font-bold truncate text-stone-text leading-tight">{entry.title}</p>
        <p className="text-[9px] text-stone-400 font-medium mt-0.5">{dateStr}</p>
      </div>
    </div>
  );
};

export default PotteryCard;
