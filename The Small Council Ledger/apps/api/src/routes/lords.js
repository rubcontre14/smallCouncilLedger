import Joi from '@hapi/joi';

const lordPayload = Joi.object({
  name: Joi.string().required(),
  title: Joi.string().allow('').optional(),
  houseId: Joi.string().required(),
});

const lordPatch = Joi.object({
  name: Joi.string().optional(),
  title: Joi.string().allow('').optional(),
  houseId: Joi.string().optional(),
}).min(1);

export default function register(server) {
  const store = () => server.app.store;

  server.route({
    method: 'GET',
    path: '/api/lords',
    handler: async (request, h) => {
      const houseId = request.query.houseId || undefined;
      const list = await store().listLords({ houseId });
      return h.response(list).type('application/json');
    },
  });

  server.route({
    method: 'GET',
    path: '/api/lords/{id}',
    handler: async (request, h) => {
      const lord = await store().getLordById(request.params.id);
      if (!lord) return h.response({ error: 'Lord not found' }).code(404);
      return h.response(lord).type('application/json');
    },
  });

  server.route({
    method: 'POST',
    path: '/api/lords',
    options: {
      validate: { payload: lordPayload },
    },
    handler: async (request, h) => {
      const lord = await store().createLord(request.payload);
      return h.response(lord).type('application/json').code(201);
    },
  });

  server.route({
    method: 'PATCH',
    path: '/api/lords/{id}',
    options: {
      validate: { payload: lordPatch },
    },
    handler: async (request, h) => {
      const lord = await store().updateLord(request.params.id, request.payload);
      if (!lord) return h.response({ error: 'Lord not found' }).code(404);
      return h.response(lord).type('application/json');
    },
  });

  server.route({
    method: 'DELETE',
    path: '/api/lords/{id}',
    handler: async (request, h) => {
      const ok = await store().deleteLord(request.params.id);
      if (!ok) return h.response({ error: 'Lord not found' }).code(404);
      return h.response().code(204);
    },
  });

  server.route({
    method: 'GET',
    path: '/api/lords/{id}/power-index',
    handler: async (request, h) => {
      const result = await store().getPowerIndex(request.params.id);
      if (!result) return h.response({ error: 'Lord not found' }).code(404);
      return h.response(result).type('application/json');
    },
  });
}
