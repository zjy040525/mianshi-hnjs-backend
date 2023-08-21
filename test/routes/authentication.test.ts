import { test } from 'tap';
import { build } from '../helper.js';

test('测试无效参数', async (t) => {
  const app = await build(t);

  const res = await app.inject({
    url: '/authentication',
    method: 'POST',
    payload: {},
  });
  t.equal(JSON.parse(res.payload).message, '请求参数无效！');
});

test('测试用户名或密码错误', async (t) => {
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

test('测试用户sign登录成功', async (t) => {
  const app = await build(t);

  const res = await app.inject({
    url: '/authentication',
    method: 'POST',
    payload: {
      username: JSON.parse(process.env.SIGN_USERS || '')?.[0]?.[0],
      password: process.env.TEST_PASSWORD,
    },
  });
  t.equal(JSON.parse(res.payload).message, '登录成功！');
});

test('测试用户interview登录成功', async (t) => {
  const app = await build(t);

  const res = await app.inject({
    url: '/authentication',
    method: 'POST',
    payload: {
      username: JSON.parse(process.env.INTERVIEW_USERS || '')?.[0]?.[0],
      password: process.env.TEST_PASSWORD,
    },
  });
  t.equal(JSON.parse(res.payload).message, '登录成功！');
});

test('测试用户admin登录成功', async (t) => {
  const app = await build(t);

  const res = await app.inject({
    url: '/authentication',
    method: 'POST',
    payload: {
      username: JSON.parse(process.env.ADMIN_USERS || '')?.[0]?.[0],
      password: process.env.TEST_PASSWORD,
    },
  });
  t.equal(JSON.parse(res.payload).message, '登录成功！');
});
