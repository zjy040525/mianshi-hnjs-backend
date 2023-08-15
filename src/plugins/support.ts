import fp from 'fastify-plugin';

export default fp(async (fastify) => {
  fastify.decorate('preHandler', async (request, reply) => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const payload: any = await request.jwtVerify();
      const user = await fastify.userModel.findOne({
        where: {
          username: payload.username,
          password: payload.password,
        },
      });
      if (!user) {
        throw new NotFoundException(404, '用户不存在！');
      }
      // preHandler done.
    } catch (e) {
      reply.code(e.statusCode).send(
        fastify.assign({
          code: e.statusCode,
          message: e.message,
        }),
      );
      return;
    }
  });
  fastify.decorate('assign', ({ code, data = null, message = 'ok' }) => {
    return {
      code,
      data,
      message,
    };
  });
});

declare module 'fastify' {
  export interface FastifyInstance {
    readonly preHandler: (
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      request: FastifyRequest<any>,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      reply: FastifyReply<any>,
    ) => Promise<void>;
    readonly assign: (payload: PayloadType) => NonNullable<PayloadType>;
  }
}

type PayloadType = {
  code: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data?: any;
  message?: string;
};

// 自定义错误异常
class NotFoundException {
  constructor(
    public statusCode: number,
    public message: string,
  ) {}
}
