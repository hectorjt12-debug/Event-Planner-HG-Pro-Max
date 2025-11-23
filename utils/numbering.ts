import { Table } from './autoLayoutEngine';

export function asignarNumeros(tablas: Table[]): Table[] {
  let normales = 1;
  let vips = 1;

  return tablas.map(t => {
    if (t.vip) {
      return { ...t, numero: `VIP-${vips++}` };
    } else {
      return { ...t, numero: normales++ };
    }
  });
}