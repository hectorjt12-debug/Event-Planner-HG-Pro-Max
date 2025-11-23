import React from 'react';

export function cinematicCamera(svgRef: React.RefObject<SVGSVGElement | null>) {
  if (!svgRef.current) return;

  const svg = svgRef.current;
  svg.style.transition = "transform 2.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)";
  svg.style.transform = "scale(1.4) translate(-30px, 20px)";

  setTimeout(() => {
    if (svg) {
      svg.style.transform = "scale(1) translate(0px, 0px)";
    }
  }, 2600);
}