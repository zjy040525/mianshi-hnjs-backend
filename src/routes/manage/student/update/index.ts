import type { FastifyPluginAsync } from 'fastify';

/**
 * 更新用户面试信息
 * @param fastify
 */
const update: FastifyPluginAsync = async (fastify) => {
  fastify.route({
    url: '/',
    method: 'PATCH',
    preHandler: [fastify.preHandler],
    async handler(request, reply) {
      const {
        studentId,
        interviewedUserId,
        interviewedDate,
        signStatus,
        signedUserId,
        signedDate,
        urbanRailTransitInterview,
        tourismManagementInterview,
        earlyChildhoodEducationInterview,
      } = request.body as BodyType;
      if (!(typeof signStatus === 'boolean' && studentId)) {
        reply.code(400).send(
          fastify.assign({
            code: 400,
            message: '请求参数无效！',
          }),
        );
        return;
      }

      if (
        signStatus &&
        !(interviewedDate && interviewedUserId && signedDate && signedUserId)
      ) {
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

      if (signStatus) {
        const signedUser = await fastify.userModel.findOne({
          where: {
            id: signedUserId,
          },
        });
        const interviewedUser = await fastify.userModel.findOne({
          where: {
            id: interviewedUserId,
          },
        });
        if (!signedUser) {
          reply.code(400).send(
            fastify.assign({
              code: 400,
              message: '签到的执行人不存在！',
            }),
          );
          return;
        }
        if (!interviewedUser) {
          reply.code(400).send(
            fastify.assign({
              code: 400,
              message: '面试的执行人不存在！',
            }),
          );
          return;
        }

        await fastify.studentModel.update(
          {
            interviewedDate,
            interviewedUserId,
            signStatus,
            signedDate,
            signedUserId,
            tourismManagementInterview,
            urbanRailTransitInterview,
            earlyChildhoodEducationInterview,
          },
          {
            where: {
              id: studentId,
            },
          },
        );
      } else {
        // 重置为初始值
        await fastify.studentModel.update(
          {
            interviewedDate: null,
            interviewedUserId: null,
            signStatus,
            signedDate: null,
            signedUserId: null,
            tourismManagementInterview: student.tourismManagementInterview
              ? 'Processing'
              : null,
            urbanRailTransitInterview: student.urbanRailTransitInterview
              ? 'Processing'
              : null,
            earlyChildhoodEducationInterview:
              student.earlyChildhoodEducationInterview ? 'Processing' : null,
          },
          {
            where: {
              id: studentId,
            },
          },
        );
      }
      // 推送所有消息
      await fastify.notification.sendStudent();
      reply.send(
        fastify.assign({
          code: 200,
          message: '更新成功！',
        }),
      );
    },
  });
};

export default update;

type BodyType = Partial<{
  studentId: number;
  interviewedUserId: number;
  interviewedDate: string;
  signStatus: boolean;
  signedUserId: number;
  signedDate: string;
  urbanRailTransitInterview: string;
  tourismManagementInterview: string;
  earlyChildhoodEducationInterview: string;
}>;
