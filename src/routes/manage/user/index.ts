import type { FastifyPluginAsync } from 'fastify';

/**
 * 用户操作信息socket
 * @param fastify
 */
const user: FastifyPluginAsync = async (fastify) => {
  fastify.get(
    '/',
    {
      websocket: true,
    },
    (connection) => {
      connection.socket.on('message', async (data: Buffer) => {
        try {
          const buf = Buffer.from(data);
          const json = JSON.parse(buf.toString());
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const payload: any = fastify.jwt.verify(json.token);
          const user = await fastify.userModel.findOne({
            where: {
              username: payload.username,
              password: payload.password,
            },
          });

          if (!user) {
            throw new Exception('用户不存在！');
          }

          if (user.role !== 'admin-all') {
            throw new Exception('权限不足！');
          }

          // 添加自定义tag，用于分发不同的socket内容
          Object.defineProperty(connection.socket, 'tag', {
            value: 'USER_WS',
          });
        } catch (e) {
          connection.socket.send(
            JSON.stringify({
              type: 'error',
              key: 'USER_WS',
              message: process.env.APP_NAME,
              description: e.message,
            }),
          );

          connection.socket.close();
        }
      });
    },
  );
};

export default user;

class Exception {
  constructor(public message: string) {}
}
