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
  declare name: string;
  declare gender: string;
  declare id_card: string;
  declare graduated_school: string;
  declare telephone_number: string;
  declare registration_number: string;
  declare sign_status: boolean;
  declare signed_date: string;
  declare signed_operator: null | number;

  declare interview_xq: 'Processing' | 'Success' | 'Failed';
  declare interview_ly: 'Processing' | 'Success' | 'Failed';
  declare interview_gd: 'Processing' | 'Success' | 'Failed';
  declare interviewed_date: string;
  declare interviewed_operator: null | number;
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
          id_card: DataTypes.STRING,
          graduated_school: DataTypes.STRING,
          telephone_number: DataTypes.STRING,
          registration_number: DataTypes.STRING,
          sign_status: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
          },
          signed_date: DataTypes.DATE,
          signed_operator: DataTypes.INTEGER,
          interview_xq: DataTypes.ENUM('Processing', 'Success', 'Failed'),
          interview_ly: DataTypes.ENUM('Processing', 'Success', 'Failed'),
          interview_gd: DataTypes.ENUM('Processing', 'Success', 'Failed'),
          interviewed_date: DataTypes.DATE,
          interviewed_operator: DataTypes.INTEGER,
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
