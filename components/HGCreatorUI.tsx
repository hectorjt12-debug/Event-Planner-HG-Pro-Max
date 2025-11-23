import React from "react";
import { usePlannerStore } from "../store/usePlannerStore";
import { useHGCreatorStore } from "../store/HGCreatorStore";
import { HGCreatorBrain } from "../store/core/HGCreatorBrain";
import { nanoid } from "nanoid";

export default function HGCreatorUI() {
  const { addArea } = usePlannerStore();
  const { generatedItems } = useHGCreatorStore();

  const handleAreaClick = (area: string) => {
    let type = "extra";
    let width = 10;
    let height = 10;
    let color = "#888";

    switch(area) {
        case "SALÓN": type = "salon"; width = 20; height = 30; color="#2563eb"; break;
        case "CARPA": type = "carpa"; width = 15; height = 20; color="#22c55e"; break;
        case "TERRAZA": type = "terraza"; width = 15; height = 10; color="#a855f7"; break;
        case "COCINA": type = "cocina"; width = 8; height = 6; color="#f97316"; break;
        case "LOUNGE": type = "lounge"; width = 10; height = 10; color="#db2777"; break;
        default: break;
    }

    addArea({
        id: nanoid(),
        name: area,
        type: type as any,
        width,
        height,
        x: 2500,
        y: 2500,
        color
    });
  };

  const generateItem = async () => {
    // Generate a random luxury item since no input is provided in this view
    const prompts = [
        "Mesa de mármol negro para 10 personas",
        "Silla Tiffany dorada con cojín blanco",
        "Lounge modular de terciopelo azul",
        "Barra iluminada LED curva",
        "Pista de baile de cristal"
    ];
    const randomPrompt = prompts[Math.floor(Math.random() * prompts.length)];
    const parsed = HGCreatorBrain.parseVoiceCommand(randomPrompt);
    
    await HGCreatorBrain.createFurniture({
      ...parsed,
      prompt: randomPrompt,
      label: parsed.category + " IA"
    });
  };

  return (
    <div style={{ padding: "20px", color: "white" }}>
      {/* Botones de generación */}
      <button
        onClick={generateItem}
        style={{
          width: "100%",
          padding: "14px",
          borderRadius: "12px",
          border: "none",
          background: "#5c3aff",
          color: "#fff",
          fontWeight: "bold",
          cursor: "pointer",
        }}
      >
        GENERAR CON IA
      </button>

      {/* Botones de áreas (Salón, Carpa, Terraza, Cocina, Lounge) */}
      <div style={{ display: "flex", gap: "10px", marginTop: "20px", flexWrap: "wrap" }}>
        {["SALÓN", "CARPA", "TERRAZA", "COCINA", "LOUNGE"].map((area) => (
          <button
            key={area}
            onClick={() => handleAreaClick(area)}
            style={{
              padding: "10px 20px",
              borderRadius: "8px",
              border: "1px solid #333",
              background: "#222",
              color: "#fff",
              cursor: "pointer",
            }}
          >
            {area}
          </button>
        ))}
      </div>

      {/* Galería de elementos */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: "10px",
          marginTop: "25px",
        }}
      >
        {generatedItems.slice().reverse().map((item) => (
          <div
            key={item.id}
            style={{
              background: "#00000066",
              padding: "10px",
              borderRadius: "12px",
              border: "1px solid #333",
            }}
          >
            <img
              src={item.imageReal}
              alt="preview"
              style={{
                width: "100%",
                height: "80px",
                objectFit: "cover",
                borderRadius: "8px",
              }}
            />
            <div style={{ marginTop: "8px", color: "#fff", fontSize: "12px" }}>
              <b style={{ textTransform: "uppercase", color: "#0DAAF3" }}>
                <span style={{ opacity: 0.7 }}>{item.tier}</span>
              </b>
              <div style={{ fontSize: "10px", color: "#ccc", marginTop: "2px" }}>
                {item.label}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
