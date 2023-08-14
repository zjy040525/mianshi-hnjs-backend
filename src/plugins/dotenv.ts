import chalk from 'chalk';
import dotenv from 'dotenv';
import fp from 'fastify-plugin';

export default fp(
  async (fastify) => {
    await fastify.register(async (_fastify, _options, done) => {
      const mode = process.env.NODE_ENV;
      if (mode === 'development') {
        dotenv.config();
        dotenv.config({
          path: '.env.development',
          override: true,
        });
      } else if (mode === 'production') {
        dotenv.config({
          path: '.env.production',
          override: true,
        });
      }
      // 测试环境的变量在`test/helper.ts`中的config函数进行配置
      // 测试环境是独立的node环境，无法在这里拿到process.env
      // ...

      console.log(chalk.magenta(mode));
      fastify.decorate('dotenv', dotenv);
      fastify.decorate('mode', mode);
      done();
    });
  },
  {
    name: 'dotenv',
  },
);

declare module 'fastify' {
  export interface FastifyInstance {
    readonly dotenv: typeof dotenv;
    readonly mode: typeof process.env.NODE_ENV;
  }
}
