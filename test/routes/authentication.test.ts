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

test('测试sign登录成功', async (t) => {
  const app = await build(t);

  const res = await app.inject({
    url: '/authentication',
    method: 'POST',
    payload: {
      username: 'test_sign',
      password: 'test_sign1234',
    },
  });
  t.equal(JSON.parse(res.payload).message, '登录成功！');
});

test('测试interview登录成功', async (t) => {
  const app = await build(t);

  const res = await app.inject({
    url: '/authentication',
    method: 'POST',
    payload: {
      username: 'test_iview',
      password: 'test_iview1234',
    },
  });
  t.equal(JSON.parse(res.payload).message, '登录成功！');
});

test('测试admin登录成功', async (t) => {
  const app = await build(t);

  const res = await app.inject({
    url: '/authentication',
    method: 'POST',
    payload: {
      username: 'test_admin',
      password: 'test_admin1234',
    },
  });
  t.equal(JSON.parse(res.payload).message, '登录成功！');
});
