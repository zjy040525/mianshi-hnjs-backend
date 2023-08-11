import chalk from 'chalk';
import fp from 'fastify-plugin';
import { DataTypes, Model, Sequelize } from 'sequelize';

class User extends Model {}
class Student extends Model {}

export default fp(
  async (fastify) => {
    fastify.register(async (fastify, options, done) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const [host, port]: any[] = process.env.MYSQL_ADDRESS.split(':');
      const sequelize = new Sequelize({
        host,
        port,
        username: process.env.MYSQL_USERNAME,
        password: process.env.MYSQL_PASSWORD,
        database: process.env.MYSQL_DATABASE,
        dialect: 'mysql',
      });
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
          permission: {
            type: DataTypes.ENUM('SIGN', 'INTERVIEW', 'MANAGE'),
            allowNull: false,
          },
        },
        {
          sequelize,
          timestamps: false,
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
          sequelize,
          timestamps: false,
        },
      );
      await sequelize.authenticate();
      console.log(chalk.green('Connection has been established successfully.'));
      await sequelize.sync();
      console.log(chalk.green('All models were synchronized successfully.'));
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      fastify.decorate('sequelize', sequelize);
      fastify.decorate('user', User);
      fastify.decorate('student', Student);
      fastify.addHook('onClose', (_request, done) =>
        sequelize.close().finally(done),
      );
      done();
    });
  },
  {
    name: 'sequelize',
    dependencies: ['dotenv'],
  },
);

declare module 'fastify' {
  export interface FastifyInstance {
    sequelize: Sequelize;
    user: typeof User;
    student: typeof Student;
  }
}
