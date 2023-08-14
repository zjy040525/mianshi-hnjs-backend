import chalk from 'chalk';
import fp from 'fastify-plugin';
import { DataTypes, Model } from 'sequelize';

class User extends Model {}
class Student extends Model {}

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
      fastify.decorate('user', User);
      fastify.decorate('student', Student);
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
    readonly user: typeof User;
    readonly student: typeof Student;
  }
}
