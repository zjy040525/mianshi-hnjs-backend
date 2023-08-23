import chalk from 'chalk';
import dotenv from 'dotenv';
import fp from 'fastify-plugin';

export default fp(
  async (fastify) => {
    await fastify.register(async (_fastify, _options, done) => {
      const mode = process.env.NODE_ENV;
      switch (mode) {
        case 'development':
          dotenv.config();
          dotenv.config({
            path: '.env.development',
            override: true,
          });
          break;
        case 'production':
          dotenv.config({
            path: '.env.production',
            override: true,
          });
          break;
      }
      // 测试环境的变量在`test/helper.ts`中的config函数进行配置
      // 测试环境是独立的node环境，这里不能获取到
      // ...

      // 打印当前环境
      console.log(chalk.magenta(mode));
      // 添加到fastify全局实例上，方便后续路由或插件使用
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
