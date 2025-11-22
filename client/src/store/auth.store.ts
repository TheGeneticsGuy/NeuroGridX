import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { jwtDecode } from 'jwt-decode';

interface User {
  id: string;
  role: 'Standard' | 'BCI' | 'Admin';
}

// Store's state/actions
interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  setToken: (token: string) => void;
  updateUser: (data: { token: string }) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  // The persist middleware auto stores the state to the local storage. Very cool!
  persist(
    (set) => ({
      token: null,
      user: null,
      isAuthenticated: false,
      setToken: (token) => {
        try {
          // Decode the token
          const decodedUser: User = jwtDecode(token);
          set({
            token,
            user: decodedUser,
            isAuthenticated: true,
          });
        } catch (error) {
          console.error("Failed to decode token:", error);
          // Clearing auth state if get corrupted token
          set({ token: null, user: null, isAuthenticated: false });
        }
      },
      updateUser: (data) => {
        try {
            const decodedUser: User = jwtDecode(data.token);
            set({
                token: data.token,
                user: decodedUser,
                isAuthenticated: true,
            });
        } catch (error) {
            console.error("Failed to decode token when updating user:", error);
        }
      },
      logout: () => {
        set({ token: null, user: null, isAuthenticated: false });
      },
    }),
    {
      name: 'auth-storage', // local storage name
    }
  )
);