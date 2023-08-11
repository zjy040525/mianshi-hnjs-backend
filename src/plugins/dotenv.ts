import chalk from 'chalk';
import dotenv from 'dotenv';
import fp from 'fastify-plugin';

export default fp(
  async (fastify) => {
    await fastify.register((_fastify, _options, done) => {
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
      } else {
        // 测试环境是独立的node环境，这里无法正常加载环境配置
        // 正确的环境配置在test/helper.ts里面的config函数
        console.log(chalk.blue('test'));
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
