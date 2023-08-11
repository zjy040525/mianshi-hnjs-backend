import fp from 'fastify-plugin';

export interface SupportPluginOptions {
  // Specify Support plugin options here
}

// The use of fastify-plugin is required to be able
// to export the decorators to the outer scope
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default fp<SupportPluginOptions>(async (instance, opts) => {
  instance.decorate('someSupport', function () {
    return 'hugs';
  });
});

// When using .decorate you have to specify added properties for Typescript
declare module 'fastify' {
  export interface FastifyInstance {
    someSupport(): string;
  }
}
