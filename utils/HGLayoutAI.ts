import { PlannerItem } from "../store/usePlannerStore";

export const HGLayoutAI = {
  smart(items: PlannerItem[]): PlannerItem[] {
    const spacing = 260;
    const margin = 200;

    // Filter items to arrange (usually tables)
    // We will arrange items that are typically arranged in grids (tables)
    // Fixed items like stages, dance floors (large items) might be skipped or placed first.
    // For this 'God Level' logic, we assume we are re-flowing the main tables.
    
    const toArrange = items.filter(i => i.category === 'mesas' || i.type?.includes('round') || i.type === 'rect');
    const others = items.filter(i => !(i.category === 'mesas' || i.type?.includes('round') || i.type === 'rect'));

    let x = margin;
    let y = margin;

    const arranged = toArrange.map((m, i) => {
      const placed = {
        ...m,
        x,
        y,
      };

      x += spacing;
      // Wrap logic (10 items per row roughly or based on width)
      if (x > margin + spacing * 10) {
        x = margin;
        y += spacing;
      }

      return placed;
    });

    return [...others, ...arranged];
  },
  
  auto(items: PlannerItem[]) {
      return this.smart(items);
  }
};