import { FastifyPluginAsync } from 'fastify';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const root: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  fastify.get('/', async function (request, reply) {
    return { root: true };
  });
};

export default root;
