import chalk from 'chalk';
import fp from 'fastify-plugin';
import { DataTypes, Model } from 'sequelize';

class User extends Model {
  declare id: number;
  declare username: string;
  declare nickname: string;
  declare password: string;
  declare role: 'sign-all' | 'interview-all' | 'admin-all';
}
class Student extends Model {
  // 主键
  declare id: number;
  // 姓名
  declare name: string;
  // 性别
  declare gender: string;
  // 身份证号
  declare idCard: string;
  // 毕业学校
  declare graduatedSchool: string;
  // 手机号
  declare telephoneNumber: string;
  // 中考报名序号
  declare registrationNumber: string;
  // 签到状态
  declare signStatus: boolean;
  // 签到时间
  declare signedDate: string;
  // 执行签到的用户
  declare signedUserId: null | number;
  // 学前专业面试
  declare earlyChildhoodEducationInterview:
    | 'Processing'
    | 'Success'
    | 'Failed'
    | null;
  // 旅游专业面试
  declare tourismManagementInterview:
    | 'Processing'
    | 'Success'
    | 'Failed'
    | null;
  // 城轨专业面试
  declare urbanRailTransitInterview: 'Processing' | 'Success' | 'Failed' | null;
  // 面试时间
  declare interviewedDate: string;
  // 执行面试的用户
  declare interviewedUserId: null | number;
}
class Log extends Model {
  // 主键
  declare id: number;
  // 记录时间
  declare recordDate: string;
  // 记录用户的id
  declare recordUserId: string;
  // 记录学生的id
  declare recordStudentId: string;
  // 记录操作类型
  declare recordType: 'Auth' | 'Sign' | 'Print' | 'Interview';
  declare recordEarlyChildhoodEducationInterview:
    | 'Processing'
    | 'Success'
    | 'Failed'
    | null;
  declare recordTourismManagementInterview:
    | 'Processing'
    | 'Success'
    | 'Failed'
    | null;
  declare recordUrbanRailTransitInterview:
    | 'Processing'
    | 'Success'
    | 'Failed'
    | null;
}

export default fp(
  async (fastify) => {
    await fastify.register(async (_fastify, _options, done) => {
      User.init(
        {
          username: {
            type: DataTypes.STRING,
            unique: true,
            allowNull: false,
          },
          nickname: DataTypes.STRING,
          password: {
            type: DataTypes.STRING,
            allowNull: false,
          },
          role: {
            type: DataTypes.ENUM('sign-all', 'interview-all', 'admin-all'),
            allowNull: false,
          },
        },
        {
          sequelize: fastify.sequelize,
          timestamps: false,
          modelName: 'users',
        },
      );
      Student.init(
        {
          name: DataTypes.STRING,
          gender: DataTypes.STRING,
          idCard: DataTypes.STRING,
          graduatedSchool: DataTypes.STRING,
          telephoneNumber: DataTypes.STRING,
          registrationNumber: DataTypes.STRING,
          signStatus: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
          },
          signedDate: DataTypes.DATE,
          signedUserId: DataTypes.INTEGER,
          earlyChildhoodEducationInterview: DataTypes.ENUM(
            'Processing',
            'Success',
            'Failed',
          ),
          tourismManagementInterview: DataTypes.ENUM(
            'Processing',
            'Success',
            'Failed',
          ),
          urbanRailTransitInterview: DataTypes.ENUM(
            'Processing',
            'Success',
            'Failed',
          ),
          interviewedDate: DataTypes.DATE,
          interviewedUserId: DataTypes.INTEGER,
        },
        {
          sequelize: fastify.sequelize,
          modelName: 'students',
          timestamps: false,
        },
      );
      Log.init(
        {
          recordDate: DataTypes.DATE,
          recordUserId: DataTypes.INTEGER,
          recordStudentId: DataTypes.INTEGER,
          recordType: {
            type: DataTypes.ENUM('Auth', 'Sign', 'Print', 'Interview'),
            allowNull: false,
          },
          recordEarlyChildhoodEducationInterview: DataTypes.ENUM(
            'Processing',
            'Success',
            'Failed',
          ),
          recordTourismManagementInterview: DataTypes.ENUM(
            'Processing',
            'Success',
            'Failed',
          ),
          recordUrbanRailTransitInterview: DataTypes.ENUM(
            'Processing',
            'Success',
            'Failed',
          ),
        },
        {
          sequelize: fastify.sequelize,
          timestamps: false,
          modelName: 'logs',
        },
      );
      // 同步模型
      await fastify.sequelize.sync({
        logging: false,
      });
      console.log(chalk.green('All models were synchronized successfully.'));
      fastify.decorate('userModel', User);
      fastify.decorate('studentModel', Student);
      fastify.decorate('logModel', Log);
      fastify.decorate('studentAssoc', async (studentList) => {
        /**
         * 合并用户信息字段对象
         * @param student 学生对象模型
         */
        const assoc = async (student: Student) => {
          let signedUser = null;
          let interviewedUser = null;

          if (student.signedUserId) {
            signedUser = await fastify.userModel.findOne({
              where: {
                id: student.signedUserId,
              },
              attributes: ['username', 'nickname'],
              logging: false,
            });
          }

          if (student.interviewedUserId) {
            interviewedUser = await fastify.userModel.findOne({
              where: {
                id: student.interviewedUserId,
              },
              attributes: ['username', 'nickname'],
              logging: false,
            });
          }
          return {
            ...student.toJSON(),
            signedUser,
            interviewedUser,
          };
        };

        if (Array.isArray(studentList)) {
          return await Promise.all(
            studentList.map(async (student) => await assoc(student)),
          );
        }
        return await assoc(studentList);
      });
      fastify.decorate('logAssoc', async (logList) => {
        const assoc = async (log: Log) => {
          let recordUser = null;
          let recordStudent = null;

          if (log.recordUserId) {
            recordUser = await fastify.userModel.findOne({
              where: {
                id: log.recordUserId,
              },
              attributes: ['username', 'nickname'],
              logging: false,
            });
          }

          if (log.recordStudentId) {
            recordStudent = await fastify.studentModel.findOne({
              where: {
                id: log.recordStudentId,
              },
              logging: false,
            });
          }

          return {
            ...log.toJSON(),
            recordUser,
            recordStudent,
          };
        };
        return await Promise.all(logList.map(async (log) => await assoc(log)));
      });
      done();
    });
  },
  {
    name: 'model',
    dependencies: ['sequelize'],
  },
);

declare module 'fastify' {
  export interface FastifyInstance {
    readonly userModel: typeof User;
    readonly studentModel: typeof Student;
    readonly logModel: typeof Log;
    readonly studentAssoc: (
      studentList: Student[] | Student,
    ) => Promise<Student[] | Student>;
    readonly logAssoc: (logList: Log[]) => Promise<Log[]>;
  }
}
