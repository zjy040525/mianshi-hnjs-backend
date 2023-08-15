import type { AutoloadPluginOptions } from '@fastify/autoload';
import AutoLoad from '@fastify/autoload';
import fastifyCors from '@fastify/cors';
import fastifyJwt from '@fastify/jwt';
import fastifyView from '@fastify/view';
import fastifyWebsocket from '@fastify/websocket';
import chalk from 'chalk';
import type { FastifyPluginAsync } from 'fastify';
import handlebars from 'handlebars';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export type AppOptions = {
  // Place your custom options for app below here.
} & Partial<AutoloadPluginOptions>;

// Pass --options via CLI arguments in command to enable these options.
const options: AppOptions = {};

const app: FastifyPluginAsync<AppOptions> = async (
  fastify,
  opts,
): Promise<void> => {
  // Place here your custom code!
  if (!process.env.SECRET_KEY) {
    console.log(chalk.red('required `SECRET_KEY` environment variable!'));
    process.exit(1);
  }
  // cors
  void fastify.register(fastifyCors);
  // jwt
  void fastify.register(fastifyJwt, {
    secret: process.env.SECRET_KEY,
    sign: {
      algorithm: 'HS256',
      expiresIn: '7d',
      aud: 'mianshi-hnjs',
      iss: 'mianshi-hnjs-backend',
    },
  });
  // ws
  void fastify.register(fastifyWebsocket);
  // html
  void fastify.register(fastifyView, {
    engine: {
      handlebars,
    },
  });

  // Do not touch the following lines

  // This loads all plugins defined in plugins
  // those should be support plugins that are reused
  // through your application
  void fastify.register(AutoLoad, {
    dir: path.join(__dirname, 'plugins'),
    options: opts,
    forceESM: true,
  });

  // This loads all plugins defined in routes
  // define your routes in one of these
  void fastify.register(AutoLoad, {
    dir: path.join(__dirname, 'routes'),
    options: opts,
    forceESM: true,
  });
};

export default app;
export { app, options };
