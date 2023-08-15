import type { FastifyPluginAsync } from 'fastify';
import { Sequelize } from 'sequelize';

/**
 * 学生面试
 * @param fastify
 */
const interview: FastifyPluginAsync = async (fastify) => {
  fastify.route({
    url: '/',
    method: 'GET',
    preHandler: [fastify.preHandler],
    async handler(request, reply) {
      const { studentId, xq, gd, ly } = request.body as BodyType;
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

      if (user.role !== 'interview-all') {
        reply.code(400).send(
          fastify.assign({
            code: 400,
            message: '权限不足！',
          }),
        );
        return;
      }

      if (
        student.interviewed_operator &&
        student.interviewed_operator !== user.id
      ) {
        const user = await fastify.userModel.findOne({
          where: {
            id: student.interviewed_operator,
          },
        });
        if (!user) {
          reply.code(400).send(
            fastify.assign({
              code: 400,
              message: '该学生对应的面试操作员不存在，请联系管理员！',
            }),
          );
          return;
        }

        reply.code(400).send(
          fastify.assign({
            code: 400,
            message: `操作越权，请到${user.nickname || user.username}处操作！`,
          }),
        );
        return;
      }

      await fastify.studentModel.update(
        {
          interview_xq: student.interview_xq ? xq : null,
          interview_ly: student.interview_ly ? ly : null,
          interview_gd: student.interview_gd ? gd : null,
          interviewed_date: Sequelize.fn('now'),
          interviewed_operator: user.id,
        },
        {
          where: {
            id: studentId,
          },
        },
      );
    },
  });
};

type BodyType = Partial<{
  studentId: string;
  xq: string;
  gd: string;
  ly: string;
}>;

export default interview;
