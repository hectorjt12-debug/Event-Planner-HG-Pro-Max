import { usePlannerStore } from "../store/usePlannerStore";
import { nanoid } from "nanoid";

export function rotateItem(id: string) {
  usePlannerStore.setState((state) => {
    const item = state.items.find(i => i.id === id);
    if (!item) return state;
    
    // Rotate by 45 degrees
    const newRotation = ((item.rotation || 0) + 45) % 360;
    
    const newItems = state.items.map(i => 
        i.id === id ? { ...i, rotation: newRotation } : i
    );
    
    const newSelected = state.selected?.id === id ? { ...state.selected, rotation: newRotation } : state.selected;

    return { items: newItems, selected: newSelected };
  });
}

export function duplicateItem(id: string) {
  const { items, addItem } = usePlannerStore.getState();
  const base = items.find(i => i.id === id);
  
  if (base) {
      const { id: _, ...rest } = base;
      addItem({
        ...rest,
        id: nanoid(),
        x: base.x + 50, // Slight offset
        y: base.y + 50,
      });
  }
}

export function toggleLock(id: string) {
    usePlannerStore.setState((state) => {
        const updatedItems = state.items.map(i => 
            i.id === id ? { ...i, locked: !i.locked } : i
        );
        const updatedSelected = state.selected?.id === id 
            ? { ...state.selected, locked: !state.selected.locked } 
            : state.selected;
            
        return { items: updatedItems, selected: updatedSelected };
    });
}

export function groupItems(ids: string[]) {
  const groupId = "group-" + crypto.randomUUID();
  usePlannerStore.setState((state) => {
      const updatedItems = state.items.map(i => 
          ids.includes(i.id) ? { ...i, groupId } : i
      );
      return { items: updatedItems };
  });
  return groupId;
}

export function HGLiveReflow(items: any[]) {
  let changed = false;
  const updated = items.map(item => {
    let newX = item.x;
    let newY = item.y;
    
    if (item.category === "mesas" || item.type === "mesa") {
      if (item.y < 100) { newY = 100; changed = true; }
      if (item.x < 100) { newX = 100; changed = true; }
    }
    return changed ? { ...item, x: newX, y: newY } : item;
  });
  
  if (changed) {
      usePlannerStore.setState({ items: updated });
  }
}