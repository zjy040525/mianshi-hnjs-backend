import type { FastifyPluginAsync } from 'fastify';
import { Op, Sequelize } from 'sequelize';

/**
 * 学生签到搜索
 * @param fastify
 */
const search: FastifyPluginAsync = async (fastify) => {
  fastify.route({
    url: '/',
    method: 'GET',
    preHandler: [fastify.preHandler],
    async handler(request, reply) {
      const { idCard } = request.query as QueryType;
      if (!idCard) {
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

      if (user.role !== 'sign-all') {
        reply.code(400).send(
          fastify.assign({
            code: 400,
            message: '权限不足！',
          }),
        );
        return;
      }

      const students = await fastify.studentModel.findAll({
        where: {
          // 学生身份证模糊查询
          idCard: {
            [Op.like]: `%${idCard}%`,
          },
        },
        // 优先显示未签到的学生
        order: [
          Sequelize.literal(`signStatus=false DESC`),
          Sequelize.literal(`signedUserId=${user.id} DESC`),
          ['signedDate', 'DESC'],
        ],
        limit: 25,
      });
      reply.send(
        fastify.assign({
          code: 200,
          data: students,
        }),
      );
    },
  });
};

type QueryType = Partial<{
  idCard: string;
}>;

export default search;
