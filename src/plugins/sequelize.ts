import fp from 'fastify-plugin';
import { Sequelize } from 'sequelize';

export default fp(
  async (fastify) => {
    await fastify.register(async (fastify, _options, done) => {
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
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      fastify.decorate('sequelize', sequelize);
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
  }
}
