import React from 'react';
import { Armchair, Box, Circle, Utensils, LayoutTemplate, Layers, Music } from 'lucide-react';

const libraryData = {
  "mesas": [
    { "nombre": "Redonda 6", "icon": "round6.png", "w": 120, "h": 120 },
    { "nombre": "Redonda 8", "icon": "round8.png", "w": 150, "h": 150 },
    { "nombre": "Redonda 10", "icon": "round10.png", "w": 180, "h": 180 },
    { "nombre": "Imperial 6m", "icon": "imperial6.png", "w": 600, "h": 110 },
    { "nombre": "Rectangular 2.4m", "icon": "rect24.png", "w": 240, "h": 100 }
  ],
  "sillas": [
    { "nombre": "Tiffany Blanca", "icon": "tiffany_white.png", "w": 45, "h": 45 },
    { "nombre": "Versalles Oro", "icon": "versailles_gold.png", "w": 45, "h": 45 },
    { "nombre": "Crossback Madera", "icon": "crossback.png", "w": 45, "h": 45 }
  ],
  "pistas": [
    { "nombre": "Pista Madera", "icon": "pista1.png", "w": 600, "h": 600 },
    { "nombre": "Pista LED", "icon": "pista_led.png", "w": 800, "h": 800 }
  ],
  "escenarios": [
    { "nombre": "Escenario Bajo", "icon": "stage_low.png", "w": 400, "h": 300 },
    { "nombre": "Escenario Circular", "icon": "stage_circle.png", "w": 500, "h": 500 }
  ],
  "estaciones": [
    { "nombre": "Barra Premium", "icon": "bar_premium.png", "w": 300, "h": 120 },
    { "nombre": "Candy Bar", "icon": "candy.png", "w": 220, "h": 120 },
    { "nombre": "Estación Gourmet", "icon": "gourmet.png", "w": 260, "h": 120 }
  ]
};

interface ObjectsLibraryProps {
  onAdd: (obj: any) => void;
}

const getIcon = (category: string) => {
  switch(category) {
    case 'mesas': return <Circle size={16} />;
    case 'sillas': return <Armchair size={16} />;
    case 'pistas': return <Music size={16} />;
    case 'escenarios': return <Layers size={16} />;
    case 'estaciones': return <Utensils size={16} />;
    default: return <Box size={16} />;
  }
}

export function ObjectsLibrary({ onAdd }: ObjectsLibraryProps) {
  return (
    <div className="text-white p-4 space-y-8">
      <h2 className="text-[#D4AF37] font-display font-bold text-xl mb-6 text-center tracking-[0.2em] border-b-2 border-[#D4AF37]/20 pb-4">
        GALERÍA PREMIUM HG
      </h2>
      {Object.entries(libraryData).map(([category, items]) => (
        <div key={category} className="animate-fade-in">
          <div className="flex items-center gap-3 mb-4 text-[#D4AF37]/90">
            {getIcon(category)}
            <h3 className="text-sm uppercase font-bold tracking-[0.15em]">{category}</h3>
          </div>
          <div className="grid grid-cols-1 gap-3">
            {items.map((o) => (
              <button
                key={o.nombre}
                className="group relative w-full p-4 rounded-xl bg-gradient-to-r from-[#111] to-[#0a0a0a] border border-white/5 hover:border-[#D4AF37]/60 transition-all duration-300 text-left shadow-lg hover:shadow-[#D4AF37]/10 overflow-hidden"
                onClick={() => onAdd({ 
                    ...o, 
                    category, 
                    id: crypto.randomUUID(),
                    type: category === 'sillas' ? 'silla' : 'mueble',
                    color: "#ffffff" 
                })}
              >
                {/* Hover Shine */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#D4AF37]/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                
                <div className="relative z-10 flex justify-between items-center">
                  <span className="font-medium text-sm text-gray-300 group-hover:text-[#D4AF37] transition-colors tracking-wide">{o.nombre}</span>
                  <span className="text-[10px] text-gray-600 group-hover:text-gray-400 font-mono bg-black/40 px-2 py-1 rounded border border-white/5">
                    {o.w}×{o.h}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}