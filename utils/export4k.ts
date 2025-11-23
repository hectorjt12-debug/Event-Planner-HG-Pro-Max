import html2canvas from "html2canvas";

export async function export4K(id: string = "plano-fondo") {
  const el = document.getElementById(id);
  if (!el) return;
  
  // Create a clone to export without UI overlays or transforms that might break capture
  const canvas = await html2canvas(el, { scale: 4, backgroundColor: '#050505', useCORS: true });
  const img = canvas.toDataURL("image/png");

  const a = document.createElement("a");
  a.href = img;
  a.download = `HG_Event_4K_${Date.now()}.png`;
  a.click();
}