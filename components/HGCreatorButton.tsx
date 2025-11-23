import React, { useState } from "react";
import HGCreatorUI from "./HGCreatorUI";
import { Sparkles } from "lucide-react";

export default function HGCreatorButton() {
  const [show, setShow] = useState(false);

  return (
    <>
      <button
        onClick={() => setShow(!show)}
        className="fixed bottom-6 right-6 z-[60] flex items-center gap-2 px-6 py-4 bg-[#5c3aff] text-white rounded-2xl shadow-[0_10px_50px_rgba(92,58,255,0.4)] transition-all hover:scale-105 hover:bg-[#4a2ce0]"
      >
        <Sparkles size={20} />
        <span className="font-bold text-lg">HG CREATOR</span>
      </button>

      {show && (
        <div style={{
          position: "fixed",
          bottom: "90px",
          right: "20px",
          width: "260px", 
          maxHeight: "80vh",
          overflowY: "auto",
          zIndex: 60,
        }} className="custom-scrollbar animate-in slide-in-from-bottom-10 duration-300">
          <HGCreatorUI />
        </div>
      )}
    </>
  );
}