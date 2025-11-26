import React from "react";
import { usePlannerStore } from "../store/usePlannerStore";
import { useHGCreatorStore } from "../store/HGCreatorStore";
import { HGCreatorBrain } from "../store/core/HGCreatorBrain";
import { nanoid } from "nanoid";
import { Sparkles, Plus, Box } from "lucide-react";

export default function HGCreatorUI() {
  // Separated Stores for Correct Functionality
  const { addArea, addItem } = usePlannerStore();
  const { generatedItems } = useHGCreatorStore();

  const handleAreaClick = (area: string) => {
    let type = "extra";
    let width = 10;
    let height = 10;
    let color = "#888";

    switch(area) {
        case "SALÓN": type = "salon"; width = 20; height = 30; color="#1e293b"; break;
        case "CARPA": type = "carpa"; width = 15; height = 20; color="#22c55e"; break;
        case "TERRAZA": type = "terraza"; width = 15; height = 10; color="#a855f7"; break;
        case "COCINA": type = "cocina"; width = 8; height = 6; color="#f97316"; break;
        case "LOUNGE": type = "lounge"; width = 10; height = 10; color="#db2777"; break;
        default: break;
    }

    addArea({
        id: nanoid(),
        name: area,
        type: type as any,
        width,
        height,
        x: 2500 + (Math.random() * 50), // Random offset so they don't stack perfectly
        y: 2500 + (Math.random() * 50),
        color,
        rotation: 0
    });
  };

  const generateItem = async () => {
    const prompts = [
        "Mesa de mármol negro para 10 personas",
        "Silla Tiffany dorada con cojín blanco",
        "Lounge modular de terciopelo azul",
        "Barra iluminada LED curva",
        "Pista de baile de cristal"
    ];
    const randomPrompt = prompts[Math.floor(Math.random() * prompts.length)];
    const parsed = HGCreatorBrain.parseVoiceCommand(randomPrompt);
    
    const newItem = await HGCreatorBrain.createFurniture({
      ...parsed,
      prompt: randomPrompt,
      label: parsed.category + " IA"
    });

    // Automatically add to canvas planner
    addItem({
        id: newItem.id,
        name: newItem.label || "Item IA",
        w: 100,
        h: 100,
        size: 100,
        x: 2500,
        y: 2500,
        rotation: 0,
        type: 'mueble',
        category: 'mueble',
        color: '#ffffff',
        locked: false,
        tier: "ai-generated"
    });
  };

  return (
    <div className="p-5 text-white pointer-events-auto h-full flex flex-col">
      <div className="mb-6 text-center">
         <h3 className="font-display font-bold text-[#00f3ff] tracking-widest text-sm">AI FURNITURE LAB</h3>
         <p className="text-[10px] text-gray-500">Generative Design Engine</p>
      </div>

      {/* AI Generator Button */}
      <button
        onClick={generateItem}
        className="hg-btn primary w-full py-4 rounded-xl font-bold text-sm tracking-wide shadow-lg mb-6 flex items-center justify-center gap-2 group"
      >
        <Sparkles size={16} className="animate-pulse group-hover:rotate-12 transition-transform" />
        GENERATE WITH AI
      </button>

      <div className="space-y-4">
        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Quick Structures</label>
        <div className="grid grid-cols-2 gap-2">
            {["SALÓN", "CARPA", "TERRAZA", "COCINA", "LOUNGE"].map((area) => (
            <button
                key={area}
                onClick={() => handleAreaClick(area)}
                className="hg-btn neon py-2 text-[10px] font-medium hover:bg-white/5"
            >
                <Plus size={10} className="inline mr-1" /> {area}
            </button>
            ))}
        </div>
      </div>

      {/* Recent Generations */}
      <div className="mt-6 flex-1 overflow-y-auto custom-scrollbar">
        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3 block">Recent Assets</label>
        <div className="grid grid-cols-2 gap-3">
            {generatedItems.slice().reverse().map((item) => (
            <div
                key={item.id}
                className="bg-black/40 border border-white/10 rounded-xl p-2 hover:border-[#00f3ff]/50 transition-colors group cursor-pointer"
                onClick={() => addItem({
                    ...item, 
                    id: nanoid(), 
                    x: 2500, y: 2500, 
                    w: 100, h: 100, 
                    rotation: 0,
                    locked: false 
                })}
            >
                <div className="aspect-square rounded-lg bg-gray-900 mb-2 overflow-hidden relative">
                    <img
                        src={item.imageReal}
                        alt="preview"
                        className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity"
                    />
                    <div className="absolute top-1 right-1 bg-black/60 rounded-full p-1">
                        <Box size={10} className="text-[#00f3ff]" />
                    </div>
                </div>
                <div className="text-center">
                    <span className="text-[9px] font-bold text-[#00f3ff] uppercase tracking-wider">{item.tier}</span>
                </div>
            </div>
            ))}
        </div>
      </div>
    </div>
  );
}