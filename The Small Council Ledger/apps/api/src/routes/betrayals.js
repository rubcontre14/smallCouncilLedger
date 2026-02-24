import Joi from '@hapi/joi';

const createPayload = Joi.object({
  lordId: Joi.string().required(),
  targetLordId: Joi.string().required(),
  description: Joi.string().allow('').optional(),
});

export default function register(server) {
  server.route({
    method: 'GET',
    path: '/api/lords/{lordId}/betrayals',
    handler: async (request, h) => {
      const list = await request.server.app.store.listBetrayalsByLord(request.params.lordId);
      return h.response(list).type('application/json');
    },
  });

  server.route({
    method: 'POST',
    path: '/api/betrayals',
    options: {
      validate: { payload: createPayload },
    },
    handler: async (request, h) => {
      const betrayal = await request.server.app.store.createBetrayal(request.payload);
      return h.response(betrayal).type('application/json').code(201);
    },
  });
}
