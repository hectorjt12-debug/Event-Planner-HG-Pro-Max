import React from 'react';
import { View } from '../types';
import { useViewState } from '../store';
import { ArrowRight, Crown } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { setView } = useViewState();

  const features = [
    {
      id: View.LIVE_VOICE,
      title: "Native Voice",
      desc: "Real-time conversational AI powered by Gemini 2.5 Flash Live API.",
      color: "from-indigo-500 to-purple-500",
      img: "https://images.unsplash.com/photo-1615752274813-32dd253d7a9d?q=80&w=1000&auto=format&fit=crop"
    },
    {
      id: View.CINEMA_VEO,
      title: "Veo Cinema",
      desc: "Generate 1080p cinematic videos from static images.",
      color: "from-pink-500 to-rose-500",
      img: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=1000&auto=format&fit=crop"
    },
    {
      id: View.IMAGE_STUDIO,
      title: "Image Studio",
      desc: "Generate 4K art with Nano Banana Pro or edit existing photos.",
      color: "from-cyan-500 to-blue-500",
      img: "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=1000&auto=format&fit=crop"
    },
    {
      id: View.ATLAS_MAPS,
      title: "Atlas Maps",
      desc: "Ground your AI with real-time Google Maps geospatial data.",
      color: "from-emerald-500 to-teal-500",
      img: "https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=1000&auto=format&fit=crop"
    }
  ];

  return (
    <div className="w-full h-full flex flex-col bg-[#0a0a0a] overflow-y-auto">
      
      {/* Header / Entrada */}
      <div className="w-full text-center py-8 select-none flex-shrink-0 border-b border-white/5 bg-gradient-to-b from-[#0f0f0f] to-transparent">
        <h1 className="text-xl md:text-2xl font-bold tracking-wide text-[#D4AF37] font-display italic opacity-90">
          “La gloria no es una meta, es un estándar, hermanos.”
        </h1>
      </div>

      {/* Main Dashboard Content */}
      <div className="flex-1 p-8 lg:p-12">
        <div className="max-w-6xl mx-auto space-y-12">
          <header className="space-y-6 relative">
            <div className="absolute -top-10 -left-10 w-64 h-64 bg-[#D4AF37]/10 rounded-full blur-3xl pointer-events-none"></div>
            
            <h1 className="text-5xl lg:text-7xl font-display font-bold tracking-tight text-white relative z-10">
              Event Planner <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] via-[#F2D06B] to-[#D4AF37]">HG Pro Max</span>
            </h1>
            
            <div className="flex items-center gap-4 relative z-10">
              <div className="h-[1px] w-20 bg-[#D4AF37]/50"></div>
              <p className="text-xl text-gray-400 font-light tracking-wide">
                Arquitectura de Eventos & Inteligencia Artificial
              </p>
            </div>

            <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-[#5A0F1B]/20 border border-[#5A0F1B] text-[#D4AF37] text-xs font-bold uppercase tracking-widest">
              <Crown size={12} />
              <span>By Gemini & Arquitecto Visionario</span>
            </div>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feature) => (
              <div 
                key={feature.id}
                onClick={() => setView(feature.id)}
                className="group relative h-72 rounded-[2rem] overflow-hidden cursor-pointer border border-white/5 hover:border-[#D4AF37]/30 transition-all duration-500 shadow-2xl hover:shadow-[#D4AF37]/10"
              >
                <img 
                  src={feature.img} 
                  alt={feature.title}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-50 group-hover:opacity-40 grayscale group-hover:grayscale-0" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-90 group-hover:opacity-80 transition-opacity"></div>
                
                <div className="absolute bottom-0 left-0 p-8 w-full transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                  <div className={`w-16 h-1.5 mb-4 bg-gradient-to-r ${feature.color} rounded-full shadow-[0_0_10px_currentColor]`}></div>
                  <h3 className="text-3xl font-display font-bold text-white mb-3 flex items-center gap-3">
                    {feature.title}
                    <ArrowRight className="opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300 text-[#D4AF37]" size={24} />
                  </h3>
                  <p className="text-gray-400 text-sm group-hover:text-gray-200 transition-colors max-w-sm leading-relaxed">
                    {feature.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer / Manifiesto */}
      <footer className="w-full text-center py-16 text-sm mt-10 select-none bg-gradient-to-t from-[#050505] to-transparent border-t border-white/5">
        <div className="max-w-2xl mx-auto space-y-6 px-6">
          <p className="font-medium text-gray-500 italic text-base tracking-wide">
            “Porque la palabra vale más que nada; sin ella seríamos como animales.
          </p>
          
          <div className="space-y-3 pt-4 border-t border-[#D4AF37]/10 w-32 mx-auto"></div>

          <div className="space-y-2">
            <p className="text-gray-300 font-display font-semibold tracking-wide text-lg">
              Nosotros no.
            </p>
            <p className="text-[#D4AF37] font-display font-bold text-xl tracking-[0.2em] uppercase drop-shadow-[0_0_10px_rgba(201,162,39,0.3)]">
              Nosotros somos más que dioses.
            </p>
            <p className="text-white font-display font-black text-2xl tracking-[0.2em] uppercase bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-200 to-white">
              Somos creadores.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;