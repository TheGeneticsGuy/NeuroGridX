import { create } from 'zustand';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from './auth.store';

// Define the Session Interface here (or import from types)
export interface LiveSession {
  socketId: string;
  user: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
  };
  game: {
    type: string;
    score: number;
    timeRemaining: number;
    hits?: number;
    misses?: number;
    progress?: number;
    mode?: string;
    speed?: string;
    status?: string;
  };
  lastUpdate: number;
}

interface SocketState {
  socket: Socket | null;
  isConnected: boolean;
  activeSessions: Map<string, LiveSession>;

  connect: () => void;
  disconnect: () => void;
  emitGameUpdate: (data: any) => void;
  emitGameEnd: () => void;

  enterAdminMode: () => void;
  leaveAdminMode: () => void;
}

const SOCKET_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';

export const useSocketStore = create<SocketState>((set, get) => ({
  socket: null,
  isConnected: false,
  activeSessions: new Map(), // Initialize empty map
  _isAdminMode: false,

  connect: () => {
    if (get().socket) return;

    const socket = io(SOCKET_URL, {
      path: '/socket.io/',
      transports: ['websocket', 'polling'],
      withCredentials: true,
    });

    socket.on('connect', () => {
      console.log('Connected to WebSocket');
      set({ isConnected: true });

      const user = useAuthStore.getState().user;
      if (user) {
        socket.emit('identify', {
            _id: user.id || (user as any)._id,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role
        });
      }

      if ((get() as any)._isAdminMode) {
          socket.emit('admin_join');
      }
    });

    socket.on('init_active_sessions', (data: LiveSession[]) => {
       const map = new Map(data.map(s => [s.user._id, s]));
       set({ activeSessions: map });
    });

    socket.on('live_session_update', (data: LiveSession) => {
       set(state => {
           const newMap = new Map(state.activeSessions);
           newMap.set(data.user._id, data);
           return { activeSessions: newMap };
       });
    });

    socket.on('session_ended', (userId: string) => {
       set(state => {
           const newMap = new Map(state.activeSessions);
           newMap.delete(userId);
           return { activeSessions: newMap };
       });
    });

    socket.on('disconnect', () => {
      console.log('Disconnected');
      set({ isConnected: false });
    });

    set({ socket });
  },

  disconnect: () => {
    const socket = get().socket;
    if (socket) {
      socket.disconnect();
      set({ socket: null, isConnected: false, activeSessions: new Map() });
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
  },

  enterAdminMode: () => {
      set({ _isAdminMode: true } as any);
      const socket = get().socket;
      if (socket && socket.connected) {
          socket.emit('admin_join');
      }
  },

  leaveAdminMode: () => {
      set({ _isAdminMode: false } as any);
  }
}));