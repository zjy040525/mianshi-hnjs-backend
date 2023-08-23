import type { FastifyPluginAsync } from 'fastify';
import { Op, Sequelize } from 'sequelize';

/**
 * 学生面试搜索
 * @param fastify
 */
const search: FastifyPluginAsync = async (fastify) => {
  fastify.route({
    url: '/',
    method: 'GET',
    preHandler: [fastify.preHandler],
    async handler(request, reply) {
      const { studentId } = request.query as QueryType;
      if (!studentId) {
        reply.code(400).send(
          fastify.assign({
            code: 400,
            message: '请求参数无效！',
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

      // 根据条件查询学生
      const minId =
        isNaN(parseInt(studentId)) || parseInt(studentId) < 1
          ? 1
          : parseInt(studentId);
      const student = await fastify.studentModel.findAll({
        where: {
          // 必须是完成签到的
          signStatus: true,
          // 查询传入的学生id到之后的24个，一共查询25个
          id: {
            [Op.between]: [minId, minId + 24],
          },
        },
        // 排序：
        order: [
          Sequelize.literal('interviewedUserId IS NULL DESC'),
          Sequelize.literal(`interviewedUserId=${user.id} DESC`),
          ['interviewedDate', 'DESC'],
        ],
      });
      reply.send(
        fastify.assign({
          code: 200,
          data: await fastify.assoc(student),
        }),
      );
    },
  });
};

type QueryType = Partial<{
  studentId: string;
}>;

export default search;
