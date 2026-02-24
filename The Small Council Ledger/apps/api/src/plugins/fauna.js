import faunadb from 'faunadb';

const { Client, query: q } = faunadb;

const plugin = {
  name: 'fauna',
  version: '1.0.0',
  register: async (server, options) => {
    const secret = options?.secret ?? process.env.FAUNA_SECRET;
    if (!secret) {
      server.app.fauna = null;
      server.app.faunaQuery = null;
      return;
    }
    const client = new Client({ secret });
    server.app.fauna = client;
    server.app.faunaQuery = q;
    server.decorate('request', 'fauna', function () {
      return this.server.app.fauna;
    });
    server.decorate('request', 'faunaQuery', function () {
      return this.server.app.faunaQuery;
    });
  },
};

export default plugin;
