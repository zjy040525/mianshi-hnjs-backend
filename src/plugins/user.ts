import chalk from 'chalk';
import CryptoJS from 'crypto-js';
import fp from 'fastify-plugin';

export default fp(
  async (fastify) => {
    const createUser = async (users: string | undefined, role: string) => {
      if (users) {
        const mode = fastify.mode;
        if (mode === 'test' && !process.env.TEST_PASSWORD) {
          throw new Error('required `TEST_PASSWORD` environment variable!');
        }
        for (const user of JSON.parse(users)) {
          const [username, nickname, pwd] = user;
          // 用户密码
          const password = new Password(
            mode === 'test'
              ? process.env.TEST_PASSWORD
              : pwd || Password.random(),
          );
          try {
            // 查询是否已注册，用户名永远不能重复
            const user = await fastify.userModel.findOne({
              where: {
                username,
              },
              logging: false,
            });
            if (user) {
              throw new Exception();
            }
            // 到这里注册用户
            await fastify.userModel.create(
              {
                username,
                nickname,
                password: password.sha256(),
                role,
              },
              {
                logging: false,
              },
            );
            // 在非test环境下才会显示用户的注册信息
            if (mode !== 'test') {
              console.log(
                chalk.blue(
                  `${username}(${
                    nickname || username
                  }) has been created and the password is '${password.value}'.`,
                ),
              );
            }
          } catch (e) {
            if (e instanceof Exception) {
              // 在非test环境下显示创建失败信息
              if (mode !== 'test') {
                console.log(
                  chalk.red(
                    `${username}(${
                      nickname || username
                    }) creation failed, user already exists.`,
                  ),
                );
              }
            } else {
              // 其他系统性错误
              console.log(chalk.red(e.message));
            }
          }
        }
      }
    };
    await fastify.register(async (_fastify, _options, done) => {
      const { SIGN_USERS, INTERVIEW_USERS, ADMIN_USERS } = process.env;
      await createUser(SIGN_USERS, 'sign-all');
      await createUser(INTERVIEW_USERS, 'interview-all');
      await createUser(ADMIN_USERS, 'admin-all');
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
    const arr = value.split('');
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const tmp = arr[i];
      arr[i] = arr[j];
      arr[j] = tmp;
    }
    return arr.join('');
  }
  public static random(length = 8) {
    let password = '';
    const pattern = '1234567890';
    const pattern2 = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    for (let i = 0; i < length; i++) {
      if (i & 1) {
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

class Exception {
  constructor() {}
}
