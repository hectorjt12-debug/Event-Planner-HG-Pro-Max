import React from 'react';

export default function MimiOverlay() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-xl z-10 mix-blend-overlay opacity-60">
      <div className="absolute inset-0 bg-gradient-to-br from-pink-200/30 to-purple-300/30 blur-3xl"></div>
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent_70%)]"></div>
    </div>
  );
}