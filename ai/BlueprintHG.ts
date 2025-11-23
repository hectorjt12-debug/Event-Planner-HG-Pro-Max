import { usePlannerStore } from "../store/usePlannerStore";
import { HGLayoutAI } from "../utils/HGLayoutAI";
import { nanoid } from "nanoid";

export const BlueprintHG = {
  fullWedding() {
    const store = usePlannerStore.getState();

    store.reset();

    // Escenario
    store.addItem({
      id: nanoid(),
      name: "Escenario",
      type: "stage",
      category: "escenarios",
      size: 500,
      w: 500,
      h: 300,
      rotation: 0,
      x: 200,
      y: 100,
    });

    // Pista
    store.addItem({
      id: nanoid(),
      name: "Pista",
      type: "dance",
      category: "pistas",
      size: 600,
      w: 600,
      h: 600,
      rotation: 0,
      x: 300,
      y: 400,
    });

    // 20 mesas redondas
    for (let i = 0; i < 20; i++)
      store.addItem({
        id: nanoid(),
        name: "Mesa Redonda 10",
        type: "round10",
        category: "mesas",
        size: 200,
        w: 200,
        h: 200,
        rotation: 0,
        capacity: 10,
        x: 0,
        y: 0,
      });

    // Llamar acomodo inteligente
    const items = store.items; // Get updated items
    const final = HGLayoutAI.smart(items);
    store.setAll(final);
  },
};