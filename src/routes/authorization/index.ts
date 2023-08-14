import type { FastifyPluginAsync } from 'fastify';

/**
 * 用户身份授权（验证）
 * @param fastify
 */
const authentication: FastifyPluginAsync = async (fastify) => {
  fastify.route({
    url: '/',
    method: 'POST',
    async onRequest(request, reply) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const payload: any = await request.jwtVerify();
        reply.send({
          code: 200,
          data: {
            id: payload.id,
            username: payload.username,
            nickname: payload.nickname,
            role: payload.role,
          },
          message: 'ok',
        });
      } catch (e) {
        reply.code(401).send({
          code: 401,
          data: null,
          message: e.code,
        });
      }
    },
    async handler() {},
  });
};

export default authentication;
