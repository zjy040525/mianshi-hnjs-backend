import type { FastifyPluginAsync } from 'fastify';
import { readFile } from 'fs/promises';
import { Sequelize } from 'sequelize';

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

      await fastify.logModel.create({
        recordDate: Sequelize.fn('now'),
        recordUserId: user.id,
        recordStudentId: student.id,
        recordType: 'Print',
      });
      await fastify.notification.sendLog();

      const qrCodeImage = await readFile('src/templates/QRCode.jpg');
      const qrCode = `data:image/jpg;base64,${qrCodeImage.toString('base64')}`;
      const majors = [
        student.urbanRailTransitInterview
          ? { weight: 3, name: '城市轨道交通运输与管理' }
          : { weight: 0, name: null },
        student?.tourismManagementInterview
          ? { weight: 2, name: '旅游服务与管理' }
          : { weight: 0, name: null },
        student?.earlyChildhoodEducationInterview
          ? { weight: 1, name: '幼儿教育' }
          : { weight: 0, name: null },
      ];

      const scoreList = majors
        .sort((a, b) => b.weight - a.weight)
        .map((major, index) => {
          if (!index) {
            Object.defineProperty(major, 'isHead', {
              value: true,
            });
          }
          return major;
        });
      const showList = majors
        .filter((major) => major.name)
        .sort((a, b) => b.weight - a.weight)
        .map((major, index) => {
          if (
            index === majors.length - 1 ||
            majors.filter((major) => major.name).length === 1
          ) {
            return `&nbsp; &nbsp; ${major.name}`;
          }
          return `&nbsp; &nbsp; ${major.name}<br/><br/>`;
        })
        .join('');
      // Handlebars: Access has been denied to resolve the property "id" because it is not an "own property" of its parent.
      // You can add a runtime option to disable the check or this warning:
      // See https://handlebarsjs.com/api-reference/runtime-options.html#options-to-control-prototype-access for details
      return reply.view('src/templates/document.hbs', {
        qrCode,
        parsedDate: new Date(student.signedDate).toLocaleString('zh-Hans'),
        ...student.toJSON(),
        scoreList,
        showList,
        documentName: process.env.DOCUMENT_NAME,
      });
    },
  });
};

type BodyType = Partial<{ studentId: number }>;

export default print;
