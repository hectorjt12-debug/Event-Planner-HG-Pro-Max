import React from 'react';

export default function Fake3D() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      <div className="absolute inset-0 [transform:rotateX(6deg)_scale(1.1)] opacity-30 bg-gradient-to-t from-black/20 to-transparent origin-bottom"></div>
      <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-gray-900/10 to-transparent"></div>
    </div>
  );
}