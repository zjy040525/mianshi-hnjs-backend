import type { FastifyPluginAsync } from 'fastify';

/**
 * 用户身份授权（验证）
 * @param fastify
 */
const authentication: FastifyPluginAsync = async (fastify) => {
  fastify.route({
    url: '/',
    method: 'POST',
    preHandler: [fastify.preHandler],
    async handler(request, reply) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { id, username, nickname, role }: any = request.user;
      reply.send(
        fastify.assign({
          code: 200,
          data: {
            id,
            username,
            nickname,
            role,
          },
        }),
      );
      return;
    },
  });
};

export default authentication;
