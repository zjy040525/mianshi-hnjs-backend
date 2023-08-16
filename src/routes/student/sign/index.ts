import type { FastifyPluginAsync } from 'fastify';
import { Sequelize } from 'sequelize';

/**
 * 学生签到
 * @param fastify
 */
const sign: FastifyPluginAsync = async (fastify) => {
  fastify.route({
    url: '/',
    method: 'PATCH',
    preHandler: [fastify.preHandler],
    async handler(request, reply) {
      const { studentId } = request.body as BodyType;

      // 获取请求携带过来的参数
      if (!studentId) {
        reply.code(400).send(
          fastify.assign({
            code: 400,
            message: '请求参数无效！',
          }),
        );
        return;
      }

      const student = await fastify.studentModel.findOne({
        where: {
          id: studentId,
        },
      });

      if (!student) {
        reply.code(400).send(
          fastify.assign({
            code: 400,
            message: '学生不存在！',
          }),
        );
        return;
      }

      if (student.signStatus) {
        reply.code(400).send(
          fastify.assign({
            code: 400,
            message: '该学生已经签到过了！',
          }),
        );
        return;
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { username, password }: any = request.user;
      const user = await fastify.userModel.findOne({
        where: {
          username,
          password,
        },
      });

      if (!user) {
        reply.code(400).send(
          fastify.assign({
            code: 400,
            message: '用户不存在！',
          }),
        );
        return;
      }

      if (user.role !== 'sign-all') {
        reply.code(400).send(
          fastify.assign({
            code: 400,
            message: '权限不足！',
          }),
        );
        return;
      }

      // 为学生签到
      await fastify.studentModel.update(
        {
          signStatus: true,
          signedDate: Sequelize.fn('now'),
          signedUserId: user.id,
        },
        {
          where: {
            id: studentId,
          },
        },
      );
      reply.send(
        fastify.assign({
          code: 200,
          message: '签到成功！',
        }),
      );
    },
  });
};

type BodyType = Partial<{
  studentId: number;
}>;

export default sign;
