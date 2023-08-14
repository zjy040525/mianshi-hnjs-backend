import CryptoJS from 'crypto-js';
import type { FastifyPluginAsync, FastifyRequest } from 'fastify';

type BodyType = Partial<{
  username: string;
  password: string;
}>;

/**
 * 用户身份认证
 * @param fastify
 */
const authentication: FastifyPluginAsync = async (fastify) => {
  fastify.route({
    url: '/',
    method: 'POST',
    async handler(request: FastifyRequest<{ Body: BodyType }>, reply) {
      const { username, password } = request.body;

      if (!(username && password)) {
        reply.code(400).send({
          code: 400,
          data: null,
          message: '请求参数无效！',
        });
        return;
      }

      const user = await fastify.user.findOne({
        where: {
          username,
          password: CryptoJS.SHA256(password).toString(),
        },
      });

      if (!user) {
        reply.code(401).send({
          code: 401,
          data: null,
          message: '用户名或密码错误！',
        });
        return;
      }

      const token = fastify.jwt.sign({
        username: user.username,
        nickname: user.nickname,
        password: user.password,
        role: user.role,
      });
      reply.send({
        code: 200,
        data: {
          token,
          id: user.id,
          username: user.username,
          nickname: user.nickname,
          role: user.role,
        },
        message: '登录成功！',
      });
    },
  });
};

export default authentication;
