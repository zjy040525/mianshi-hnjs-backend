import chalk from 'chalk';
import CryptoJS from 'crypto-js';
import fp from 'fastify-plugin';

// 用户配置
const roles: EnvInstance<Role> = {
  development: {
    signable: [['sign', '开发用签到管理员']],
    interviewable: [['interview', '开发用面试管理员']],
    administerable: [['admin', '开发用系统管理员']],
  },
  test: {
    signable: [['test_sign', '测试用签到管理员', 'test_sign1234']],
    interviewable: [['test_iview', '测试用面试管理员', 'test_iview1234']],
    administerable: [['test_admin', '测试用系统管理员', 'test_admin1234']],
  },
  production: {
    signable: [
      ['sign1', '一号签到管理员'],
      ['sign2', '二号签到管理员'],
      ['sign3', '三号签到管理员'],
      ['sign4', '四号签到管理员'],
      ['sign5', '五号签到管理员'],
    ],
    interviewable: [
      ['iview1', '一号面试管理员'],
      ['iview2', '二号面试管理员'],
      ['iview3', '三号面试管理员'],
      ['iview4', '四号面试管理员'],
      ['iview5', '五号面试管理员'],
    ],
    administerable: [
      ['admin1', '一号系统管理员'],
      ['admin2', '二号系统管理员'],
      ['admin3', '三号系统管理员'],
    ],
  },
};

interface EnvInstance<T> {
  readonly development: T &
    Partial<{
      password: string;
    }>;
  readonly test: T;
  readonly production: T;
}

interface Role {
  // 依次对应：用户登录名，用户昵称，用户密码
  readonly signable: UserArray;
  readonly interviewable: UserArray;
  readonly administerable: UserArray;
}

type UserArray = [string, string?, string?][];

export default fp(
  async (fastify) => {
    const create = async (users: UserArray, role: string) => {
      const mode = fastify.mode;
      for (const [username, nickname, password] of users) {
        try {
          const pwd = new Password(
            mode === 'development' && process.env.REPLACE_PASSWORD
              ? process.env.REPLACE_PASSWORD
              : password || Password.random(),
          );
          await fastify.user.create(
            {
              username,
              nickname,
              password: pwd.sha256(),
              role,
            },
            {
              logging: false,
            },
          );
          console.log(
            chalk.bgGreen(
              `${username}${
                nickname ? `(${nickname})` : ''
              } has created, login password: \`${pwd.value}\``,
            ),
          );
        } catch (e) {
          console.log(
            chalk.bgWhite(
              `${username}${
                nickname ? `(${nickname})` : ''
              } already exist, skipped.`,
            ),
          );
        }
      }
    };
    await fastify.register(async (_fastify, _options, done) => {
      const mode = fastify.mode;
      if (mode === 'development') {
        await create(roles.development.signable, 'sign-all');
        await create(roles.development.interviewable, 'interview-all');
        await create(roles.development.administerable, 'administration-all');
      } else if (mode === 'production') {
        await create(roles.production.signable, 'sign-all');
        await create(roles.production.interviewable, 'interview-all');
        await create(roles.production.administerable, 'administration-all');
      } else {
        await create(roles.test.signable, 'sign-all');
        await create(roles.test.interviewable, 'interview-all');
        await create(roles.test.administerable, 'administration-all');
      }
      done();
    });
  },
  {
    dependencies: ['dotenv', 'sequelize'],
  },
);

class Password {
  public constructor(public value: string) {}
  private static shuffle(value: string) {
    const a = value.split('');
    const n = a.length;
    for (let i = n - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const tmp = a[i];
      a[i] = a[j];
      a[j] = tmp;
    }
    return a.join('');
  }
  public static random(length = 8) {
    let password = '';
    const pattern = '1234567890';
    const pattern2 = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    for (let i = 0; i < length; i++) {
      if (i % 2) {
        password += pattern[Math.floor(Math.random() * pattern.length)];
        continue;
      }
      password += pattern2[Math.floor(Math.random() * pattern2.length)];
    }
    return this.shuffle(password);
  }
  public sha256() {
    return CryptoJS.SHA256(this.value).toString();
  }
}
