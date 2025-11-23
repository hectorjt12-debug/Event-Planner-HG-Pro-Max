import React, { useState } from "react";
import { usePlannerStore } from "../../store/usePlannerStore";
import { nanoid } from "nanoid";

export default function AreaCreator({ onClose }: { onClose?: () => void }) {
  const addArea = usePlannerStore((s) => s.addArea);

  const [name, setName] = useState("");
  const [w, setW] = useState(10);
  const [h, setH] = useState(8);
  const [type, setType] = useState("carpa");
  const [terrazaType, setTerrazaType] = useState("abierta");
  const [uso, setUso] = useState("coctel");

  const create = () => {
    addArea({
      id: nanoid(),
      name: name || type,
      width: w,
      height: h,
      x: 100, // Default start position
      y: 100,
      type: type as any,
      color:
        type === "salon"
          ? "#2563eb"
          : type === "carpa"
          ? "#22c55e"
          : type === "cocina"
          ? "#f97316"
          : type === "terraza"
          ? "#a855f7"
          : "#64748b",
      terrazaType: type === "terraza" ? terrazaType as any : undefined,
      uso: type === "terraza" ? uso as any : undefined,
      conectaCon: [],
    });
    if (onClose) onClose();
  };

  return (
    <div className="bg-black/60 p-4 w-80 border border-yellow-400 rounded-xl backdrop-blur-xl shadow-2xl">
      <div className="flex justify-between items-center mb-3">
         <h2 className="text-xl font-bold text-yellow-300">Nueva Área</h2>
         {onClose && <button onClick={onClose} className="text-gray-400 hover:text-white">✕</button>}
      </div>

      <input
        className="w-full mb-2 p-2 bg-gray-800 text-white rounded border border-gray-700 focus:border-yellow-400 outline-none"
        value={name}
        placeholder="Nombre (Ej. Pista Principal)"
        onChange={(e) => setName(e.target.value)}
      />

      <div className="grid grid-cols-2 gap-2">
        <div>
            <label className="text-xs text-gray-400">Ancho (m)</label>
            <input
            type="number"
            className="w-full p-2 bg-gray-800 text-white rounded border border-gray-700"
            value={w}
            onChange={(e) => setW(Number(e.target.value))}
            placeholder="Ancho"
            />
        </div>
        <div>
            <label className="text-xs text-gray-400">Largo (m)</label>
            <input
            type="number"
            className="w-full p-2 bg-gray-800 text-white rounded border border-gray-700"
            value={h}
            onChange={(e) => setH(Number(e.target.value))}
            placeholder="Largo"
            />
        </div>
      </div>

      <label className="block mt-2 text-xs text-gray-400">Tipo de Estructura</label>
      <select
        className="w-full mt-1 p-2 bg-gray-800 text-white rounded border border-gray-700"
        value={type}
        onChange={(e) => setType(e.target.value)}
      >
        <option value="salon">Salón</option>
        <option value="carpa">Carpa</option>
        <option value="cocina">Cocina</option>
        <option value="terraza">Terraza</option>
        <option value="extra">Extra</option>
      </select>

      {type === "terraza" && (
        <div className="mt-2 p-2 bg-purple-900/20 rounded border border-purple-500/30">
          <label className="text-xs text-purple-300">Configuración Terraza</label>
          <select
            className="w-full mt-1 p-2 bg-gray-800 text-white rounded border border-gray-700 mb-2"
            value={terrazaType}
            onChange={(e) => setTerrazaType(e.target.value)}
          >
            <option value="abierta">Abierta</option>
            <option value="techada">Techada</option>
            <option value="semi-techada">Semi-techada</option>
          </select>

          <select
            className="w-full p-2 bg-gray-800 text-white rounded border border-gray-700"
            value={uso}
            onChange={(e) => setUso(e.target.value)}
          >
            <option value="coctel">Coctel</option>
            <option value="recepcion">Recepción</option>
            <option value="vip">VIP</option>
            <option value="lounge">Lounge</option>
            <option value="fumadores">Fumadores</option>
          </select>
        </div>
      )}

      <button
        onClick={create}
        className="mt-4 w-full bg-yellow-500 hover:bg-yellow-400 text-black py-2 font-bold rounded-lg shadow-lg shadow-yellow-500/20 transition-all"
      >
        Agregar Área
      </button>
    </div>
  );
}