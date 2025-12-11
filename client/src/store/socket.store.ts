import { create } from 'zustand';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from './auth.store';

interface SocketState {
  socket: Socket | null;
  isConnected: boolean;
  connect: () => void;
  disconnect: () => void;
  emitGameUpdate: (data: any) => void;
  emitGameEnd: () => void;
}

// URL for the backend
const SOCKET_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';

export const useSocketStore = create<SocketState>((set, get) => ({
  socket: null,
  isConnected: false,

  connect: () => {
    if (get().socket) return; // Already connected

    const socket = io(SOCKET_URL);

    socket.on('connect', () => {
      console.log('Connected to WebSocket');
      set({ isConnected: true });

      // Identify immediately if logged in
      const user = useAuthStore.getState().user;
      if (user) {
        socket.emit('identify', {
            _id: user.id || user._id, // Id mismatch issue resolved
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role
        });
      }
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from WebSocket');
      set({ isConnected: false });
    });

    set({ socket });
  },

  disconnect: () => {
    const socket = get().socket;
    if (socket) {
      socket.disconnect();
      set({ socket: null, isConnected: false });
    }
  },

  emitGameUpdate: (data: any) => {
    const socket = get().socket;
    if (socket && socket.connected) {
      socket.emit('game_update', data);
    }
  },

  emitGameEnd: () => {
    const socket = get().socket;
    if (socket && socket.connected) {
      socket.emit('game_end');
    }
  }

}));