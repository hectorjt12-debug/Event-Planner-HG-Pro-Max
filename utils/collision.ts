import { PlannerItem, Area } from "../store/usePlannerStore";

interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

// Generic collision for any rect-like objects
export function rectsCollide(a: Rect, b: Rect) {
  return !(
    a.x + a.width < b.x ||
    a.x > b.x + b.width ||
    a.y + a.height < b.y ||
    a.y > b.y + b.height
  );
}

// Legacy support for existing MapEditor check
export const collides = (a: {x: number, y: number, size?: number, w?: number, h?: number}, b: {x: number, y: number, size?: number, w?: number, h?: number}) => {
  const aW = a.w || a.size || 0;
  const aH = a.h || a.size || 0;
  const bW = b.w || b.size || 0;
  const bH = b.h || b.size || 0;

  return rectsCollide(
    { x: a.x, y: a.y, width: aW, height: aH },
    { x: b.x, y: b.y, width: bW, height: bH }
  );
};

export const checkCollision = (newPos: {x: number, y: number, size: number, w: number, h: number}, id: string, items: PlannerItem[]) => {
  return items.some((other) => other.id !== id && collides(newPos, other));
};