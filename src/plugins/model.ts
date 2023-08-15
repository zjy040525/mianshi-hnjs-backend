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
      await fastify.sequelize.sync({
        logging: false,
      });
      console.log(chalk.green('All models were synchronized successfully.'));
      fastify.decorate('userModel', User);
      fastify.decorate('studentModel', Student);
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
  }
}
