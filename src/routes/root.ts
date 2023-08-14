import type { FastifyPluginAsync } from 'fastify';

const root: FastifyPluginAsync = async (fastify): Promise<void> => {
  fastify.all('/', async (_request, reply) => {
    reply.code(404);
    return;
  });
};

export default root;
