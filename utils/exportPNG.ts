import React from 'react';

export async function exportarPNG(svgRef: React.RefObject<SVGSVGElement | null>) {
  if (!svgRef.current) return;

  const svg = svgRef.current;
  const width = 3840; // 4K Resolution Width
  const height = 2160; // 4K Resolution Height

  const serializer = new XMLSerializer();
  let svgData = serializer.serializeToString(svg);

  // Ensure namespace exists for valid image source
  if (!svgData.match(/^<svg[^>]+xmlns="http\:\/\/www\.w3\.org\/2000\/svg"/)) {
    svgData = svgData.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
  }

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  // Draw background (SVG transparency fallback)
  ctx.fillStyle = "#f9fafb"; // gray-50
  ctx.fillRect(0, 0, width, height);

  const img = new Image();
  
  // Use Blob for better unicode/large string handling than btoa
  const blob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);

  img.onload = () => {
    // Draw the image scaled to fit 4K canvas
    // We assume the SVG viewBox allows scaling. 
    // Since the editor uses coordinates that might be small, 
    // we rely on the image draw to scale it up or placement.
    // For this implementation, we draw it full size.
    ctx.drawImage(img, 0, 0, width, height);

    const pngURL = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.download = `EventPlan_4K_${Date.now()}.png`;
    link.href = pngURL;
    link.click();

    URL.revokeObjectURL(url);
  };

  img.src = url;
}