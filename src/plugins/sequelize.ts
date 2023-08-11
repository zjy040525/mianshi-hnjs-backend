import chalk from 'chalk';
import fp from 'fastify-plugin';
import { Sequelize } from 'sequelize';

export default fp(async (fastify) => {
  fastify.register(async (fastify, options, done) => {
    const sequelize = new Sequelize({
      host: 'sh-cynosdbmysql-grp-h8sdocty.sql.tencentcdb.com',
      port: 27914,
      username: 'root',
      password: 'WxNs4tdm',
      database: 'hnjsxy_dev',
      dialect: 'mysql',
    });
    await sequelize.authenticate();
    console.log(chalk.green('Connection has been established successfully.'));
    await sequelize.sync();
    console.log(chalk.green('All models were synchronized successfully.'));
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    fastify.decorate('sequelize', sequelize);
    fastify.addHook('onClose', (_request, done) =>
      sequelize.close().finally(done),
    );
    done();
  });
});

declare module 'fastify' {
  export interface FastifyInstance {
    sequelize: Sequelize;
  }
}
