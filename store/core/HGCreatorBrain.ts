import { useHGCreatorStore } from "../HGCreatorStore";

export const HGCreatorBrain = {
  async generateImageReal(prompt: string) {
    // Placeholder - In production this would call Stable Diffusion or similar
    // Returning a random furniture image for demo purposes
    const images = [
        "https://images.unsplash.com/photo-1533090481720-856c6e3c1fdc?auto=format&fit=crop&w=200&q=80",
        "https://images.unsplash.com/photo-1592078615290-033ee584e267?auto=format&fit=crop&w=200&q=80",
        "https://images.unsplash.com/photo-1538688521862-da91270ad963?auto=format&fit=crop&w=200&q=80",
        "https://images.unsplash.com/photo-1503602642458-232111445857?auto=format&fit=crop&w=200&q=80"
    ];
    return images[Math.floor(Math.random() * images.length)];
  },

  async generateVector2D(params: any) {
    const id = crypto.randomUUID();
    return `<svg id="${id}" width="200" height="200">
      <circle cx="100" cy="100" r="80" fill="#ffffff22" stroke="#000" strokeWidth="2" />
    </svg>`;
  },

  async createFurniture(payload: any) {
    const store = useHGCreatorStore.getState();

    const img = await HGCreatorBrain.generateImageReal(payload.prompt || "furniture");
    const svg = await HGCreatorBrain.generateVector2D(payload);

    const finalItem = {
      ...payload,
      id: crypto.randomUUID(),
      tier: store.statusLevel,
      imageReal: img,
      vector2D: svg,
      createdAt: Date.now(),
    };

    store.addGeneratedItem(finalItem);
    return finalItem;
  },

  parseVoiceCommand(text: string) {
    const lower = text.toLowerCase();

    let result: any = {
      category: "table",
      shape: "round",
      style: "luxury",
      material: "acrylic",
      capacity: 10,
    };

    if (lower.includes("silla")) result.category = "chair";
    if (lower.includes("lounge")) result.category = "lounge";
    if (lower.includes("barra")) result.category = "bar";

    if (lower.includes("cuadrada")) result.shape = "square";
    if (lower.includes("rectangular")) result.shape = "rectangular";

    const numMatch = lower.match(/\d+/);
    if (numMatch) {
        result.capacity = Number(numMatch[0]);
    }

    return result;
  }
};
