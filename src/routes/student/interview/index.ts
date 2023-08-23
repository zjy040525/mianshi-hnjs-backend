import type { FastifyPluginAsync } from 'fastify';
import { Sequelize } from 'sequelize';

/**
 * 学生面试
 * @param fastify
 */
const interview: FastifyPluginAsync = async (fastify) => {
  fastify.route({
    url: '/',
    method: 'PATCH',
    preHandler: [fastify.preHandler],
    async handler(request, reply) {
      const {
        studentId,
        earlyChildhoodEducation,
        tourismManagement,
        urbanRailTransit,
      } = request.body as BodyType;

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

      let student = await fastify.studentModel.findOne({
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

      if (student.interviewedUserId && student.interviewedUserId !== user.id) {
        const user = await fastify.userModel.findOne({
          where: {
            id: student.interviewedUserId,
          },
        });

        if (!user) {
          reply.code(400).send(
            fastify.assign({
              code: 400,
              message: '该学生对应的用户不存在，请联系上级！',
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
          earlyChildhoodEducationInterview:
            student.earlyChildhoodEducationInterview
              ? earlyChildhoodEducation
              : null,
          tourismManagementInterview: student.tourismManagementInterview
            ? tourismManagement
            : null,
          urbanRailTransitInterview: student.urbanRailTransitInterview
            ? urbanRailTransit
            : null,
          interviewedDate: Sequelize.fn('now'),
          interviewedUserId: user.id,
        },
        {
          where: {
            id: studentId,
          },
        },
      );
      // 更新最新数据
      student = await student.reload();
      // 发送对应的socket通知
      await fastify.notification.interview(student, user);

      reply.send(
        fastify.assign({
          code: 200,
          data: await fastify.assoc(student),
          message: '操作成功！',
        }),
      );
    },
  });
};

type BodyType = Partial<{
  studentId: string;
  earlyChildhoodEducation: string;
  tourismManagement: string;
  urbanRailTransit: string;
}>;

export default interview;
