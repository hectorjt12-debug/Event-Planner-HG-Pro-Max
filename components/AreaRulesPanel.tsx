import React from 'react';

export default function AreaRulesPanel() {
  return (
    <div className="bg-black/60 p-4 text-yellow-300 border border-yellow-500 rounded-xl mt-4 backdrop-blur-md shadow-xl pointer-events-auto">
      <h2 className="font-bold text-lg mb-3 flex items-center gap-2">
        <span>Reglas del Evento</span>
      </h2>

      <label className="text-xs font-bold text-gray-400 uppercase">Pasillo mínimo (m)</label>
      <input className="w-full bg-gray-900 border border-gray-700 text-white p-2 rounded mt-1 focus:border-yellow-500 outline-none" defaultValue={2} />

      <label className="mt-3 block text-xs font-bold text-gray-400 uppercase">Zona VIP</label>
      <input className="w-full bg-gray-900 border border-gray-700 text-white p-2 rounded mt-1 focus:border-yellow-500 outline-none" placeholder="Ej. Terraza Norte" />

      <label className="mt-3 block text-xs font-bold text-gray-400 uppercase">Conexiones entre áreas</label>
      <select className="w-full bg-gray-900 border border-gray-700 text-white p-2 rounded mt-1 focus:border-yellow-500 outline-none">
        <option>Salón ↔ Carpa</option>
        <option>Salón ↔ Terraza</option>
        <option>Carpa ↔ Cocina</option>
        <option>Cocina ↔ Salón</option>
      </select>
    </div>
  );
}