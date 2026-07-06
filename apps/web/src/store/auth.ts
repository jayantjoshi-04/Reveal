/** Auth state: token + current identity. */
import { create } from 'zustand';
import { setToken } from '../lib/api.js';

export type Role = 'student' | 'facilitator' | 'admin';

interface AuthState {
  role: Role | null;
  name: string | null;
  instanceId: string | null;
  signIn: (role: Role, name: string, token: string) => void;
  setInstance: (id: string) => void;
  signOut: () => void;
}

export const useAuth = create<AuthState>((set) => ({
  role: (localStorage.getItem('reveal_role') as Role | null) ?? null,
  name: localStorage.getItem('reveal_name'),
  instanceId: localStorage.getItem('reveal_instance'),
  signIn: (role, name, token) => {
    setToken(token);
    localStorage.setItem('reveal_role', role);
    localStorage.setItem('reveal_name', name);
    set({ role, name });
  },
  setInstance: (id) => {
    localStorage.setItem('reveal_instance', id);
    set({ instanceId: id });
  },
  signOut: () => {
    setToken(null);
    localStorage.removeItem('reveal_role');
    localStorage.removeItem('reveal_name');
    localStorage.removeItem('reveal_instance');
    set({ role: null, name: null, instanceId: null });
  },
}));
