import type { FastifyPluginAsync } from 'fastify';
import { readFile } from 'fs/promises';

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

      const qrCodeImage = await readFile('src/templates/QRCode.jpg');
      const qrCode = `data:image/jpg;base64,${qrCodeImage.toString('base64')}`;
      const majors = [];
      if (student.urbanRailTransitInterview) {
        majors.push({ value: '城市轨道交通运输与管理' });
      }
      if (student.tourismManagementInterview) {
        majors.push({ value: '旅游服务与管理' });
      }
      if (student.earlyChildhoodEducationInterview) {
        majors.push({ value: '幼儿教育' });
      }
      const scoreList = majors.map((major, index) => {
        if (!index) {
          Object.defineProperty(major, 'isHead', {
            value: true,
          });
        }
        return major;
      });
      console.log('scoreList', scoreList);
      const showList = majors
        .map((major, index) => {
          if (index === majors.length - 1) {
            return `&nbsp; &nbsp; ${major.value}`;
          }
          return `&nbsp; &nbsp; ${major.value}<br/><br/>`;
        })
        .join('');
      console.log('showList', showList);
      // Handlebars: Access has been denied to resolve the property "id" because it is not an "own property" of its parent.
      // You can add a runtime option to disable the check or this warning:
      // See https://handlebarsjs.com/api-reference/runtime-options.html#options-to-control-prototype-access for details
      return reply.view('src/templates/document.hbs', {
        qrCode,
        parsedDate: new Date(student.signedDate).toLocaleString('zh-Hans'),
        ...student.dataValues,
        scoreList,
        showList,
      });
    },
  });
};

type BodyType = Partial<{ studentId: number }>;

export default print;
