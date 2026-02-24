export default function register(server) {
  server.route({
    method: 'GET',
    path: '/api/houses',
    handler: async (request, h) => {
      const store = request.server.app.store;
      if (!store || typeof store.listHouses !== 'function') {
        return h.response({ error: 'Store not available' }).code(503).type('application/json');
      }
      const list = await store.listHouses();
      const arr = Array.isArray(list) ? list : [];
      return h.response(arr).type('application/json');
    },
  });

  server.route({
    method: 'GET',
    path: '/api/houses/{id}',
    handler: async (request, h) => {
      const house = await request.server.app.store.getHouseById(request.params.id);
      if (!house) return h.response({ error: 'House not found' }).code(404);
      return h.response(house).type('application/json');
    },
  });
}
