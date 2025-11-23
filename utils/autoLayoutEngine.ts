export interface Table {
  id: string;
  x: number;
  y: number;
  vip: boolean;
  numero?: string | number;
}

interface LayoutParams {
  ancho: number;
  largo: number;
  personas: number;
  paxPorMesa: number;
  estilo: string;
  vipEnabled: boolean;
}

export function autoLayoutMaster(params: LayoutParams): Table[] {
  const { ancho, largo, personas, paxPorMesa, estilo, vipEnabled } = params;
  const numTables = Math.ceil(personas / paxPorMesa);
  const tables: Table[] = [];

  const isVip = (index: number) => vipEnabled && index < numTables * 0.15;

  if (estilo === 'circular') {
    const centerX = ancho / 2;
    const centerY = largo / 2;
    let radius = 4;
    let angle = 0;
    let tablesInLayer = 6;
    
    for (let i = 0; i < numTables; i++) {
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);
      tables.push({ id: `t-${i}`, x, y, vip: isVip(i) });
      
      angle += (Math.PI * 2) / tablesInLayer;
      if (angle >= Math.PI * 2 - 0.1) {
        radius += 3.5;
        angle = 0;
        tablesInLayer += 6;
      }
    }
  } else if (estilo === 'curved') {
     for (let i = 0; i < numTables; i++) {
        const col = i % 8;
        const row = Math.floor(i / 8);
        
        // Sine wave effect
        const x = col * 3.5 + 3;
        const offset = Math.sin(x * 0.4) * 2;
        const y = row * 3.5 + 3 + offset;
        
        tables.push({ id: `t-${i}`, x, y, vip: isVip(i) });
     }
  } else {
    // Grid or Auto (Default to Grid)
    const cols = Math.floor(ancho / 3.5);
    for (let i = 0; i < numTables; i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);
      tables.push({ 
        id: `t-${i}`, 
        x: col * 3.5 + 3, 
        y: row * 3.5 + 3, 
        vip: isVip(i) 
      });
    }
  }

  return tables;
}