import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Build-time version stamp so the live site can report exactly which commit it is
// running (shown in the footer). Vercel injects VERCEL_GIT_COMMIT_SHA on every
// build; fall back to a locally-passed GIT_COMMIT or 'dev'.
const commit = (process.env.VERCEL_GIT_COMMIT_SHA ?? process.env.GIT_COMMIT ?? 'dev').slice(0, 7);

export default defineConfig({
  plugins: [react()],
  server: { port: 5173 },
  define: {
    __APP_COMMIT__: JSON.stringify(commit),
  },
});
