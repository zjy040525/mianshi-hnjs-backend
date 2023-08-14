import chalk from 'chalk';
import CryptoJS from 'crypto-js';
import fp from 'fastify-plugin';

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

export default fp(
  async (fastify) => {
    const createUser = async (users: string | undefined, role: string) => {
      if (users) {
        const mode = fastify.mode;
        if (mode === 'test' && !process.env.TEST_PASSWORD) {
          throw new TypeError('required `TEST_PASSWORD` environment variable!');
        }
        for (const user of JSON.parse(users)) {
          const [username, nickname, pwd] = user;
          const password = new Password(
            mode === 'test'
              ? process.env.TEST_PASSWORD
              : pwd || Password.random(),
          );
          try {
            await fastify.user.create(
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
            if (e instanceof TypeError) {
              console.log(chalk.red(e.message));
            } else {
              if (mode !== 'test') {
                console.log(
                  chalk.red(
                    `${username}(${
                      nickname || username
                    }) creation failed, user already exists.`,
                  ),
                );
              }
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
