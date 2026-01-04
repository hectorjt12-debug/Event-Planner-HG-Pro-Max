
import { usePlannerStore, PlannerItem, Area, EventPhase } from "../store/usePlannerStore";
import { HGLayoutAI } from "../utils/HGLayoutAI";
import { rectsCollide } from "../utils/collision";
import { nanoid } from "nanoid";

export function canPlace(item: PlannerItem | Partial<PlannerItem>, areas: Area[]) {
  const w = item.w || item.size || 100;
  const h = item.h || item.size || 100;
  
  const itemRect = {
    x: item.x || 0,
    y: item.y || 0,
    width: w,
    height: h
  };

  for (const area of areas) {
    const areaRect = {
      x: area.x,
      y: area.y,
      width: area.width * 20, 
      height: area.height * 20
    };
    if (rectsCollide(itemRect, areaRect)) return true;
  }
  return false;
}

export function autoPlace(items: PlannerItem[], areas: Area[]) {
  let x = 100;
  let y = 100;
  const placed: PlannerItem[] = [];

  for (const item of items) {
    let temp = { ...item, x, y };
    let attempts = 0;

    while (!canPlace(temp, areas) && attempts < 100) {
      x += 40;
      if (x > 2000) {
        x = 100;
        y += 40;
      }
      temp = { ...item, x, y };
      attempts++;
    }

    placed.push(temp as PlannerItem);
    x += (item.w || 100) + 20;
  }

  return placed;
}

export const HGBrain = {
  async process(command: string) {
    const store = usePlannerStore.getState();
    const cmd = command.toLowerCase();

    // 4D / Phase Transitions
    if (cmd.includes("fiesta") || cmd.includes("party")) {
       store.setEventPhase('party');
       return "Activando protocolo de fiesta: luces bajas, heatmap acústico y gente a la pista.";
    }
    if (cmd.includes("bienvenida") || cmd.includes("welcome")) {
       store.setEventPhase('welcome');
       return "Activando protocolo de bienvenida: recepción abierta y flujo de entrada.";
    }
    if (cmd.includes("montaje") || cmd.includes("setup")) {
       store.setEventPhase('setup');
       return "Regresando a modo montaje: luces de trabajo y área despejada.";
    }
    if (cmd.includes("noche")) {
       store.setTimeOfDay(22);
       store.setShowChronosFlow(true);
       return "Ajustando cronos a modo nocturno.";
    }

    // Numbers
    const num = parseInt(cmd.match(/\d+/)?.[0] || "0");

    // 1) Create items
    if (cmd.includes("mesa") && (cmd.includes("redonda") || cmd.includes("10"))) {
       const count = num || 1;
       for (let i = 0; i < count; i++)
        store.addItem({
          id: nanoid(),
          name: "Mesa Redonda 10",
          size: 160,
          w: 160,
          h: 160,
          rotation: 0,
          capacity: 10,
          type: "round10",
          category: "mesas",
          x: 2400 + (i * 10),
          y: 2400 + (i * 10),
        });
      return `Hecho: ${count} mesas redondas añadidas al plano.`;
    }

    // 2) Layout adjustment
    if (cmd.includes("acomodo") || cmd.includes("acomodar") || cmd.includes("layout")) {
      if (store.areas.length > 0) {
         const newItems = autoPlace(store.items, store.areas);
         store.setAll(newItems);
         return "Layout optimizado basado en las áreas definidas.";
      } else {
         const items = store.items;
         const arranged = HGLayoutAI.smart(items);
         store.setAll(arranged);
         return "Acomodo inteligente estándar aplicado satisfactoriamente.";
      }
    }

    // 3) Chairs
    if (cmd.includes("quitar sillas")) {
      const chairs = store.items.filter((i) => i.type === "chair" || i.category === "sillas");
      chairs.forEach((i) => store.removeItem(i.id));
      return "Todas las sillas han sido retiradas.";
    }

    if (cmd.includes("poner sillas") || cmd.includes("agregar sillas")) {
      store.items.forEach((table) => {
        if (table.capacity && (table.category === 'mesas' || table.type?.includes('round'))) {
          for (let i = 0; i < table.capacity; i++) {
            const angle = (i / table.capacity) * Math.PI * 2;
            store.addItem({
              id: nanoid(),
              name: "Silla",
              type: "chair",
              category: "sillas",
              size: 40,
              w: 40, 
              h: 40,
              rotation: (angle * 180 / Math.PI) + 90,
              x: table.x + Math.cos(angle) * (table.size / 2 + 20),
              y: table.y + Math.sin(angle) * (table.size / 2 + 20),
            });
          }
        }
      });
      return "Sillas auto-distribuidas alrededor de las mesas.";
    }
    
    // 4) Complete Wedding Blueprint
    if (cmd.includes("boda") || cmd.includes("boda completa")) {
        const { BlueprintHG } = await import("./BlueprintHG");
        BlueprintHG.fullWedding();
        return "Protocolo de Boda Completa generado exitosamente.";
    }

    return "No pude procesar esa orden. Prueba con 'fiesta', 'montaje' o 'agregar 10 mesas'.";
  },
};
