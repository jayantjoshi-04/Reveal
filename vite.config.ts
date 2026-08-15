import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // 5174 so it can run alongside the Reveal app (5173).
  server: { port: 5174 },
});
