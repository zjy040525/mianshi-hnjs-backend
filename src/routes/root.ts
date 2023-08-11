import { FastifyPluginAsync } from 'fastify';

const root: FastifyPluginAsync = async (fastify): Promise<void> => {
  fastify.all('/', async (_request, reply) => {
    reply.code(404);
  });
};

export default root;
