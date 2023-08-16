import type { FastifyPluginAsync } from 'fastify';

/**
 * 打印面试单
 * @param fastify
 */
const print: FastifyPluginAsync = async (fastify) => {
  fastify.route({
    url: '/',
    method: 'POST',
    preHandler: [fastify.preHandler],
    async handler(request, reply) {
      const { studentId } = request.body as BodyType;

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

      if (user.role !== 'sign-all') {
        reply.code(400).send(
          fastify.assign({
            code: 400,
            message: '权限不足！',
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

      if (!student.signStatus) {
        reply.code(400).send(
          fastify.assign({
            code: 400,
            message: '该学生未签到，请先签到！',
          }),
        );
        return;
      }

      if (student.signedUserId && student.signedUserId !== user.id) {
        const user = await fastify.userModel.findOne({
          where: {
            id: student.signedUserId,
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

      const interviewItems = [
        student?.urbanRailTransitInterview
          ? { weight: 3, element: '城市轨道交通运输与管理' }
          : { weight: 0, element: null },
        student?.tourismManagementInterview
          ? { weight: 2, element: '旅游服务与管理' }
          : { weight: 0, element: null },
        student?.earlyChildhoodEducationInterview
          ? { weight: 1, element: '幼儿教育' }
          : { weight: 0, element: null },
      ];
      const interviewHtmlNodes = interviewItems
        .filter((value) => value.element)
        .sort((a, b) => b.weight - a.weight)
        .map((value, index, array) => {
          let wrap = '';
          if (index === array.length - 1) {
            wrap = '<br/><br/>';
          }
          return '&nbsp; &nbsp; ' + value.element + wrap;
        })
        .join('');
      const interviewTextNodes = interviewItems
        .sort((a, b) => b.weight - a.weight)
        .map((value, index) => {
          if (index === 0) {
            Object.defineProperty(value, 'isHead', true);
          }
          return value;
        });
      // 返回html文件
      reply.view('index.hbs', {
        timestamp: new Date().getTime(),
        student,
        signeDate: new Date(student.signedDate).toLocaleString('zh-CN'),
        interviewHtmlNodes,
        interviewTextNodes,
      });
    },
  });
};

type BodyType = Partial<{ studentId: number }>;

export default print;
