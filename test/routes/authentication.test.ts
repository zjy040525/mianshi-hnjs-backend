import { test } from 'tap';
import { build } from '../helper.js';

test('authentication route invalid params', async (t) => {
  const app = await build(t);

  const res = await app.inject({
    url: '/authentication',
    method: 'POST',
    payload: {},
  });
  t.equal(JSON.parse(res.payload).message, '请求参数无效！');
});

test('authentication route username/password has error', async (t) => {
  const app = await build(t);

  const res = await app.inject({
    url: '/authentication',
    method: 'POST',
    payload: {
      username: 'NO_EXIST_USERNAME',
      password: 'NO_EXIST_PASSWORD',
    },
  });
  t.equal(JSON.parse(res.payload).message, '用户名或密码错误！');
});
