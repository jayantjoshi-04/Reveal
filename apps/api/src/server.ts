/** API entrypoint. */
import { buildApp } from './app.js';
import { env } from './config/env.js';
import { closeDb } from './config/db.js';

async function main(): Promise<void> {
  const app = await buildApp();
  const port = env().PORT;

  await app.listen({ port, host: '0.0.0.0' });
  app.log.info(`REVEAL API listening on :${port}`);

  for (const sig of ['SIGINT', 'SIGTERM'] as const) {
    process.on(sig, () => {
      app.log.info(`${sig} received — shutting down`);
      void app.close().then(closeDb).then(() => process.exit(0));
    });
  }
}

main().catch((err) => {
  console.error('Failed to start:', err);
  process.exit(1);
});
