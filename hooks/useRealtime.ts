
import { useEffect, useRef } from 'react';
import { usePlannerStore, Peer } from '../store/usePlannerStore';

// Simulates Supabase Realtime if no backend connected
export const useRealtime = () => {
  const { currentUser, updatePeer, removePeer, updateItem, addItem, removeItem } = usePlannerStore();
  const channelRef = useRef<any>(null);

  useEffect(() => {
    // In a real implementation, this would connect to Supabase
    // const channel = supabase.channel('room-1');
    // ...
    
    // MOCK SIMULATION FOR DEMO: Simulate a ghost user interacting
    const ghostId = "ghost-user-1";
    const ghostUser: Peer = {
        id: ghostId,
        name: "Collaborator AI",
        color: "#f472b6",
        cursor: { x: 2500, y: 2500 },
        selectedIds: [],
        status: 'active'
    };

    let time = 0;
    const interval = setInterval(() => {
        time += 0.05;
        // Simulate mouse movement
        const x = 2500 + Math.sin(time) * 300;
        const y = 2500 + Math.cos(time * 0.7) * 200;
        
        updatePeer(ghostId, {
            ...ghostUser,
            cursor: { x, y }
        });

        // Rarely simulate an item update
        if (Math.random() < 0.01) {
            // Find a random item to "move"
            const items = usePlannerStore.getState().items;
            if (items.length > 0) {
                const item = items[Math.floor(Math.random() * items.length)];
                if (!item.locked) {
                    updateItem(item.id, { 
                        x: item.x + (Math.random() - 0.5) * 20,
                        y: item.y + (Math.random() - 0.5) * 20 
                    }, true);
                }
            }
        }

    }, 50);

    return () => {
        clearInterval(interval);
        removePeer(ghostId);
    };
  }, []);

  // Broadcast local changes
  const broadcastCursor = (x: number, y: number) => {
      // Logic to send to Supabase:
      // channel.send({ type: 'broadcast', event: 'cursor', payload: { x, y, id: currentUser.id } })
  };

  const broadcastItemUpdate = (item: any) => {
      // channel.send({ type: 'broadcast', event: 'update', payload: item })
  };

  return { broadcastCursor, broadcastItemUpdate };
};
