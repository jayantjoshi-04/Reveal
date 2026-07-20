/** Light/dark theme, persisted and mirrored onto <html> (.dark + data-theme). */
import { create } from 'zustand';

export type Theme = 'light' | 'dark';

function apply(theme: Theme): void {
  const root = document.documentElement;
  root.dataset.theme = theme;
  root.classList.toggle('dark', theme === 'dark');
  try {
    localStorage.setItem('reveal_theme', theme);
  } catch {
    /* ignore */
  }
}

const initial = ((): Theme => {
  try {
    return (localStorage.getItem('reveal_theme') as Theme) || 'light';
  } catch {
    return 'light';
  }
})();

interface ThemeState {
  theme: Theme;
  toggle: () => void;
  set: (t: Theme) => void;
}

export const useTheme = create<ThemeState>((set, get) => ({
  theme: initial,
  toggle: () => {
    const next: Theme = get().theme === 'dark' ? 'light' : 'dark';
    apply(next);
    set({ theme: next });
  },
  set: (t) => {
    apply(t);
    set({ theme: t });
  },
}));
