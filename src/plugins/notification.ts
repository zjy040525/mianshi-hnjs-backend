import dayjs from 'dayjs';
import fp from 'fastify-plugin';
import { Op } from 'sequelize';
import type { WebSocket } from 'ws';

export default fp(
  async (fastify) => {
    fastify.decorate('notification', {
      /**
       * 推送所有学生的最新记录消息
       * @param client 已连接到WebSocket的实例
       */
      async studentAll(client) {
        // 获取签到人数
        const { count: signedCount } =
          await fastify.studentModel.findAndCountAll({
            where: {
              signStatus: true,
            },
          });
        // 获取未签到人数
        const { count: noSignedCount } =
          await fastify.studentModel.findAndCountAll({
            where: {
              signStatus: false,
            },
          });
        // 获取已面试人数
        const { count: interviewedCount } =
          await fastify.studentModel.findAndCountAll({
            where: {
              signStatus: true,
              interviewedUserId: {
                [Op.not]: null,
              },
            },
          });
        // 获取未面试人数
        const { count: noInterviewedCount } =
          await fastify.studentModel.findAndCountAll({
            where: {
              signStatus: true,
              interviewedUserId: null,
            },
          });
        const studentAll = await fastify.studentModel.findAll();
        const studentList = await fastify.assoc(studentAll);

        client.send(
          JSON.stringify({
            countList: {
              signedCount,
              noSignedCount,
              interviewedCount,
              noInterviewedCount,
            },
            studentList,
          }),
        );
      },
      /**
       * 推送学生面试的消息
       * @param student 面试的学生
       * @param user 为该学生进行面试的用户
       */
      async interview(student, user) {
        for (const client of fastify.websocketServer.clients as WS) {
          switch (client.tag) {
            case 'USER_WS':
              client.send(
                JSON.stringify({
                  key: student.idCard,
                  type: 'info',
                  message: `有新的面试消息（${
                    user.nickname || user.username
                  }）`,
                  description: `${student.name}（${student.id}）在${dayjs(
                    student.interviewedDate,
                  ).format(' HH:mm:ss ')}完成了面试。`,
                }),
              );
              break;
            case 'STUDENT_WS':
              await fastify.notification.studentAll(client);
              break;
          }
        }
      },
      /**
       * 推送学生签到的消息
       * @param student 签到的学生
       * @param user 为该学生进行签到的用户
       */
      async sign(student, user) {
        for (const client of fastify.websocketServer.clients as WS) {
          switch (client.tag) {
            case 'USER_WS':
              client.send(
                JSON.stringify({
                  key: student.idCard,
                  type: 'info',
                  message: `有新的签到消息（${
                    user.nickname || user.username
                  }）`,
                  description: `${student.name}（${student.idCard}）在${dayjs(
                    student.signedDate,
                  ).format(' HH:mm:ss ')}完成了签到。`,
                }),
              );
              break;
            case 'STUDENT_WS':
              await fastify.notification.studentAll(client);
              break;
          }
        }
      },
    });
  },
  {
    name: 'notification',
    // 依赖websocket，已在app.ts中提前注册，所以不需要手动指定依赖
  },
);

declare module 'fastify' {
  export interface FastifyInstance {
    readonly notification: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      readonly interview: (student: any, user: any) => Promise<void>;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      readonly sign: (student: any, user: any) => Promise<void>;
      readonly studentAll: (client: WebSocket) => Promise<void>;
    };
  }
}

type WS = Set<
  WebSocket & {
    tag: string;
  }
>;
