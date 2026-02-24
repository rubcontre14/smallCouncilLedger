/**
 * Plugin que expone server.app.store (local o Fauna).
 * Si USE_LOCAL_STORE=true o no hay FAUNA_SECRET, usa store local.
 * En caso contrario depende del plugin fauna (debe registrarse antes).
 */
import { createLocalStore } from '../store/localStore.js';
import { createFaunaStore } from '../store/faunaStore.js';

const plugin = {
  name: 'store',
  version: '1.0.0',
  register: async (server, options) => {
    const useLocal = process.env.USE_LOCAL_STORE === 'true' || process.env.USE_LOCAL_STORE === '1';
    const hasFauna = !!server.app.fauna && !!server.app.faunaQuery;

    if (useLocal || !hasFauna) {
      const dataDir = process.env.LOCAL_STORE_DATA_DIR;
      const dataFile = process.env.LOCAL_STORE_FILE;
      const persist = process.env.LOCAL_STORE_PERSIST !== '0' && process.env.LOCAL_STORE_PERSIST !== 'false';
      server.app.store = createLocalStore({
        dataDir: dataDir || undefined,
        dataFile: dataFile || undefined,
        persist,
      });
      server.app.useLocalStore = true;
      const houseCount = (await server.app.store.listHouses()).length;
      const lordCount = (await server.app.store.listLords()).length;
      console.log('The Small Council Ledger API: usando store LOCAL (in-memory' + (persist ? ' + archivo' : '') + `). Casas: ${houseCount}, Lords: ${lordCount}`);
    } else {
      server.app.store = createFaunaStore(server.app.fauna, server.app.faunaQuery);
      server.app.useLocalStore = false;
    }

    server.decorate('request', 'store', function () {
      return this.server.app.store;
    });
  },
};

export default plugin;
