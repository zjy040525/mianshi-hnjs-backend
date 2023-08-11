import { FastifyPluginAsync } from 'fastify';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const example: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  fastify.get('/', async function (request, reply) {
    return 'this is an example';
  });
};

export default example;
