import { Table } from './autoLayoutEngine';

class CheckpointEngine {
  private history: { [key: string]: Table[] } = {};
  
  save(name: string, data: Table[]) {
    if (data) {
      this.history[name] = JSON.parse(JSON.stringify(data));
      console.log(`Checkpoint saved: ${name}`, data.length);
    }
  }

  restore(name: string): Table[] | null {
    if (this.history[name]) {
      console.log(`Restoring checkpoint: ${name}`);
      return JSON.parse(JSON.stringify(this.history[name]));
    }
    console.warn(`Checkpoint ${name} not found`);
    return null;
  }
}

export const checkpoint = new CheckpointEngine();