import Joi from '@hapi/joi';

const createPayload = Joi.object({
  houseId: Joi.string().required(),
  targetHouseId: Joi.string().required(),
});

export default function register(server) {
  server.route({
    method: 'GET',
    path: '/api/alliances',
    handler: async (request, h) => {
      const list = await request.server.app.store.listAlliances();
      return h.response(list).type('application/json');
    },
  });

  server.route({
    method: 'GET',
    path: '/api/lords/{lordId}/alliances',
    handler: async (request, h) => {
      const list = await request.server.app.store.listAlliancesByLord(request.params.lordId);
      return h.response(list).type('application/json');
    },
  });

  server.route({
    method: 'POST',
    path: '/api/alliances',
    options: {
      validate: { payload: createPayload },
    },
    handler: async (request, h) => {
      const { houseId, targetHouseId } = request.payload;
      if (houseId === targetHouseId) {
        return h.response({ error: 'Una casa no puede aliarse consigo misma' }).type('application/json').code(400);
      }
      const list = await request.server.app.store.listAlliances();
      const exists = (list || []).some(
        (a) => (a.houseId === houseId && a.targetHouseId === targetHouseId) || (a.houseId === targetHouseId && a.targetHouseId === houseId)
      );
      if (exists) {
        return h.response({ error: 'Ya existe una alianza entre estas casas' }).type('application/json').code(409);
      }
      const alliance = await request.server.app.store.createAlliance(request.payload);
      return h.response(alliance).type('application/json').code(201);
    },
  });

  server.route({
    method: 'DELETE',
    path: '/api/alliances/{id}',
    handler: async (request, h) => {
      const ok = await request.server.app.store.deleteAlliance(request.params.id);
      if (!ok) return h.response({ error: 'Alliance not found' }).code(404);
      return h.response().code(204);
    },
  });
}
