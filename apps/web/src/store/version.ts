/** Which product version the app shows — v1 (the current instrument) or v2
 *  (the REVEAL 2.0.0 deterministic engine). Persisted, so the choice sticks. */
import { create } from 'zustand';

export type Version = 'v1' | 'v2';

const initial = ((): Version => {
  try {
    return (localStorage.getItem('reveal_version') as Version) || 'v1';
  } catch {
    return 'v1';
  }
})();

interface VersionState {
  version: Version;
  set: (v: Version) => void;
  toggle: () => void;
}

export const useVersion = create<VersionState>((set, get) => ({
  version: initial,
  set: (v) => {
    try {
      localStorage.setItem('reveal_version', v);
    } catch {
      /* ignore */
    }
    set({ version: v });
  },
  toggle: () => get().set(get().version === 'v1' ? 'v2' : 'v1'),
}));
