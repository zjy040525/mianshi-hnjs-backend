import type { FastifyPluginAsync } from 'fastify';

/**
 * 获取所有签到管理员
 * @param fastify
 */
const sign: FastifyPluginAsync = async (fastify) => {
  fastify.route({
    url: '/',
    method: 'GET',
    preHandler: [fastify.preHandler],
    async handler(_request, reply) {
      const users = await fastify.userModel.findAll({
        where: {
          role: 'sign-all',
        },
        attributes: ['id', 'username', 'nickname'],
      });
      reply.send(
        fastify.assign({
          code: 200,
          data: users,
        }),
      );
      return;
    },
  });
};

export default sign;
