export const HGTheme = {
  colors: {
    vino: "#5A0F1B",
    vinoGlow: "rgba(90, 15, 27, 0.55)",
    dorado: "#C9A227",
    doradoGlow: "rgba(201, 162, 39, 0.45)",
    negro: "#0A0A0A",
    plata: "#D0D2D3",
    fondoGlass: "rgba(15, 15, 15, 0.35)",
    neonGreen: "#22c55e",
    neonPurple: "#a855f7",
    neonOrange: "#f97316",
    neonPink: "#db2777"
  },

  radius: {
    normal: "14px",
    pill: "22px"
  },

  shadow: {
    premium:
      "0 0 25px rgba(201,162,39,0.25), 0 0 45px rgba(90,15,27,0.35)",
    soft:
      "0 8px 30px rgba(0,0,0,0.25)"
  },

  button: {
    base: `
      border-radius: 14px;
      padding: 12px 20px;
      font-weight: 600;
      letter-spacing: .5px;
      color: #FFF;
      transition: 0.25s ease;
      backdrop-filter: blur(12px);
      pointer-events: auto;
      cursor: pointer;
    `,
    
    // ... existing styles if any ...
  }
};