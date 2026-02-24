import Hapi from '@hapi/hapi';
import faunaPlugin from './plugins/fauna.js';
import housesRoutes from './routes/houses.js';
import lordsRoutes from './routes/lords.js';
import alliancesRoutes from './routes/alliances.js';
import betrayalsRoutes from './routes/betrayals.js';

const PORT = Number(process.env.PORT) || 3000;

async function start() {
  const server = Hapi.server({
    port: PORT,
    host: '0.0.0.0',
    routes: {
      cors: { origin: ['*'] },
    },
  });

  await server.register(faunaPlugin);
  await server.register((await import('./plugins/store.js')).default);
  housesRoutes(server);
  lordsRoutes(server);
  alliancesRoutes(server);
  betrayalsRoutes(server);

  await server.start();
  console.log(`The Small Council Ledger API running at ${server.info.uri}`);
  console.log(`  API base: ${server.info.uri}/api`);
}

start().catch((err) => {
  console.error(err);
  process.exit(1);
});
