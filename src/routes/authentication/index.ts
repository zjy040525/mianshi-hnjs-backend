import CryptoJS from 'crypto-js';
import type { FastifyPluginAsync } from 'fastify';

/**
 * 用户身份认证
 * @param fastify
 */
const authentication: FastifyPluginAsync = async (fastify) => {
  fastify.route({
    url: '/',
    method: 'POST',
    async handler(request, reply) {
      const { username, password } = request.body as RequestBodyType;

      if (!(username && password)) {
        reply.code(400).send(
          fastify.assign({
            code: 400,
            message: '请求参数无效！',
          }),
        );
        return;
      }

      const user = await fastify.userModel.findOne({
        where: {
          username,
          password: CryptoJS.SHA256(password).toString(),
        },
      });

      if (!user) {
        reply.code(401).send(
          fastify.assign({
            code: 401,
            message: '用户名或密码错误！',
          }),
        );
        return;
      }

      const token = fastify.jwt.sign({
        id: user.id,
        username: user.username,
        nickname: user.nickname,
        password: user.password,
        role: user.role,
      });
      reply.send(
        fastify.assign({
          code: 200,
          data: {
            token,
            id: user.id,
            username: user.username,
            nickname: user.nickname,
            role: user.role,
          },
          message: '登录成功！',
        }),
      );
    },
  });
};

export default authentication;

type RequestBodyType = Partial<{
  username: string;
  password: string;
}>;
