import React, { useState } from "react";
import { View } from "../types";
import { useViewState } from "../store";
import { Menu, ChevronLeft, Home, Mic, Image as ImageIcon, Clapperboard, Map as MapIcon, LayoutGrid } from 'lucide-react';

export default function Navigation() {
  const { currentView, setView } = useViewState();
  const [isOpen, setIsOpen] = useState(false); 

  const navItems = [
    { id: View.DASHBOARD, label: "Dashboard", icon: <Home size={18} /> },
    { id: View.LIVE_VOICE, label: "Live Voice", icon: <Mic size={18} /> },
    { id: View.IMAGE_STUDIO, label: "Image Studio", icon: <ImageIcon size={18} /> },
    { id: View.CINEMA_VEO, label: "Veo Cinema", icon: <Clapperboard size={18} /> },
    { id: View.ATLAS_MAPS, label: "Atlas Maps", icon: <MapIcon size={18} /> },
    { id: View.EVENT_PLANNER, label: "HG Planner", icon: <LayoutGrid size={18} />, isSpecial: true },
  ];

  return (
    <>
      {/* Toggle Button - Floating Fixed - FORCED POINTER EVENTS */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed top-6 z-[9999] bg-[#D4AF37] text-black px-3 py-2 rounded-xl shadow-[0_0_20px_rgba(212,175,55,0.4)] transition-all duration-300 hover:scale-110 hover:brightness-110 pointer-events-auto cursor-pointer ${isOpen ? "left-64" : "left-6"}`}
        style={{ pointerEvents: 'auto' }}
      >
        {isOpen ? <ChevronLeft size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar - Premium Fixed */}
      <nav
        className={`fixed top-0 left-0 h-full bg-[#050505]/95 backdrop-blur-xl border-r border-[#333] z-[9998] transition-all duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1.0)] overflow-hidden shadow-2xl pointer-events-auto ${
          isOpen ? "w-64 opacity-100 translate-x-0" : "w-0 opacity-0 -translate-x-10"
        }`}
      >
        <div className="p-6 h-full flex flex-col pt-20">
          <div className="mb-8">
            <h1 className="text-xl font-display font-bold text-white tracking-wide leading-none">
              EVENT PLANNER
            </h1>
            <h2 className="text-[#D4AF37] font-display font-bold text-2xl tracking-wide">
              HG PRO MAX
            </h2>
          </div>

          <ul className="flex flex-col gap-3">
            {navItems.map((item) => (
              <li
                key={item.id}
                onClick={() => { setView(item.id); setIsOpen(false); }}
                className={`cursor-pointer px-4 py-3 rounded-xl transition-all flex items-center gap-3 group relative overflow-hidden pointer-events-auto ${
                  currentView === item.id
                    ? "bg-gradient-to-r from-[#7A0026] to-[#4d0017] text-white border border-[#D4AF37]/30"
                    : "bg-zinc-900/30 text-gray-400 hover:bg-zinc-800 hover:text-white"
                }`}
              >
                <span className={`relative z-10 transition-colors ${currentView === item.id ? "text-[#D4AF37]" : "group-hover:text-[#D4AF37]"}`}>
                    {item.icon}
                </span>
                <span className="font-medium text-sm relative z-10">{item.label}</span>
              </li>
            ))}
          </ul>

          <div className="mt-auto border-t border-white/10 pt-6">
             <p className="text-xs text-gray-500 text-center font-mono">v4.0 God Mode</p>
          </div>
        </div>
      </nav>
    </>
  );
}