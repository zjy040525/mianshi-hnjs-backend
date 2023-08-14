import chalk from 'chalk';
import fp from 'fastify-plugin';
import { Sequelize } from 'sequelize';

export default fp(
  async (fastify) => {
    await fastify.register(async (_fastify, _options, done) => {
      const { MYSQL_USERNAME, MYSQL_DATABASE, MYSQL_PASSWORD, MYSQL_ADDRESS } =
        process.env;

      if (!MYSQL_ADDRESS) {
        console.log(
          chalk.red('required `MYSQL_ADDRESS` environment variable!'),
        );
        process.exit(1);
      }

      if (!MYSQL_DATABASE) {
        console.log(
          chalk.red('required `MYSQL_DATABASE` environment variable!'),
        );
        process.exit(1);
      }

      const [host, port] = MYSQL_ADDRESS.split(':');
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const sequelize = new Sequelize({
        host,
        port,
        username: MYSQL_USERNAME,
        password: MYSQL_PASSWORD,
        database: MYSQL_DATABASE,
        dialect: 'mysql',
      });
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      fastify.decorate('sequelize', sequelize);
      await fastify.sequelize.authenticate({
        logging: false,
      });
      console.log(chalk.green('Connection has been established successfully.'));
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
    readonly sequelize: Sequelize;
  }
}
