import React from "react";
import { LayoutGrid, RefreshCw, Save, RotateCcw, Crown, Sparkles, Download, MonitorPlay } from 'lucide-react';

interface PlannerPanelProps {
  onAuto: () => void;
  onStyle: (style: string) => void;
  onVIP: () => void;
  onReset: () => void;
  onSave: () => void;
  onRestore: () => void;
  onExport: () => void;
  onDirectorMode: () => void;
}

export default function PlannerPanel({ 
  onAuto, 
  onStyle, 
  onVIP, 
  onReset, 
  onSave, 
  onRestore,
  onExport,
  onDirectorMode
}: PlannerPanelProps) {
  return (
    <div className="panel-hg absolute left-6 top-6 z-30 w-72 transition-all duration-300">
      <div className="flex items-center gap-2 mb-4 border-b border-white/10 pb-3">
        <div className="p-1.5 bg-[#7A0026] rounded-md text-[#D4AF37] border border-[#D4AF37]/50">
          <LayoutGrid size={18} />
        </div>
        <h2 className="font-display font-bold text-lg text-[#D4AF37] tracking-wide">Planner Pro</h2>
      </div>

      <div className="space-y-4">
        <button 
          onClick={onAuto} 
          className="btn-hg w-full flex items-center justify-center gap-2"
        >
          <Sparkles size={18} className="text-[#D4AF37]" />
          <span>Auto-Layout AI</span>
        </button>

        <div className="space-y-2 bg-black/40 p-3 rounded-xl border border-white/5">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Layout Style</p>
          <div className="grid grid-cols-2 gap-2">
            {['grid', 'curved', 'circular', 'auto'].map((s) => (
              <button 
                key={s}
                onClick={() => onStyle(s)} 
                className="px-3 py-2 bg-gray-900/80 hover:bg-[#7A0026]/40 border border-gray-700 hover:border-[#D4AF37]/50 text-gray-300 hover:text-white rounded-lg text-xs font-medium transition-all capitalize"
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button 
            onClick={onVIP} 
            className="px-2 py-2.5 bg-pink-900/20 hover:bg-pink-900/40 border border-pink-500/30 text-pink-200 rounded-xl font-medium transition-colors flex items-center justify-center gap-1.5 group"
          >
            <Crown size={16} className="text-pink-400 group-hover:rotate-12 transition-transform" />
            <span className="text-xs">VIP Zones</span>
          </button>
           <button 
             onClick={onDirectorMode} 
             className="px-2 py-2.5 bg-amber-900/20 hover:bg-amber-900/40 border border-amber-500/30 text-amber-200 rounded-xl font-medium transition-colors flex items-center justify-center gap-1.5 group"
           >
              <MonitorPlay size={16} className="text-amber-400" />
              <span className="text-xs">Director</span>
           </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
           <button onClick={onSave} className="px-3 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl text-xs font-medium transition-colors flex items-center justify-center gap-1.5 border border-white/5">
              <Save size={14} />
              <span>Save</span>
           </button>
           <button onClick={onRestore} className="px-3 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl text-xs font-medium transition-colors flex items-center justify-center gap-1.5 border border-white/5">
              <RotateCcw size={14} />
              <span>Restore</span>
           </button>
        </div>

        <button 
          onClick={onExport} 
          className="btn-vip w-full flex items-center justify-center gap-2"
        >
          <Download size={18} />
          <span>Export 4K PNG</span>
        </button>

        <div className="pt-2 border-t border-white/10">
          <button onClick={onReset} className="w-full py-2 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-2">
              <RefreshCw size={14} />
              <span>Reset Canvas</span>
          </button>
        </div>
      </div>
    </div>
  );
}