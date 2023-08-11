import chalk from 'chalk';
import dotenv from 'dotenv';
import fp from 'fastify-plugin';

export default fp(
  async (fastify) => {
    fastify.register((fastify, options, done) => {
      dotenv.config();
      const mode = process.env.NODE_ENV;

      if (mode === 'development') {
        dotenv.config({
          path: '.env.development',
          override: true,
        });
        console.log(chalk.blue('development'));
      } else if (mode === 'production') {
        dotenv.config({
          path: '.env.production',
          override: true,
        });
        console.log(chalk.blue('production'));
      }
      fastify.decorate('dotenv', dotenv);
      done();
    });
  },
  {
    name: 'dotenv',
  },
);

declare module 'fastify' {
  export interface FastifyInstance {
    dotenv: typeof dotenv;
  }
}
