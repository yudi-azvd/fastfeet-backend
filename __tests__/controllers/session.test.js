import request from 'supertest';

import app from '../../src/app';
import truncate from '../util/truncate';

import factory from '../factories';

/**
 * Test JWT-Authenticated Express Routes with Jest And SuperTest
 * https://blog.stvmlbrn.com/2018/06/18/test-jwt-authenticated-express-routes-with-jest-and-supertest.html
 */
describe('Session', () => {
  beforeEach(async () => {
    await truncate();
  });

  it(' User should be able to authenticate', async () => {
    const user = await factory.attrs('User');

    await request(app)
      .post('/users')
      .send(user);

    const response = await request(app)
      .post('/sessions')
      .send({
        email: user.email,
        password: user.password,
      });

    expect(response.body).toHaveProperty('token');
  });

  it(' User must provide password to authenticate', async () => {
    const user = await factory.attrs('User');

    await request(app)
      .post('/users')
      .send(user);

    const response = await request(app)
      .post('/sessions')
      .send({
        email: user.email,
      });

    expect(response.status).toBe(400);
  });

  it(' User must provide CORRECT password to authenticate', async () => {
    const user = await factory.attrs('User');

    await request(app)
      .post('/users')
      .send(user);

    const response = await request(app)
      .post('/sessions')
      .send({
        email: user.email,
        password: `${user.password}23232n3nmdsnds,`,
      });

    expect(response.status).toBe(401);
  });

  it(' User must exist to authenticate', async () => {
    const response = await request(app)
      .post('/sessions')
      .send({
        email: 'yudi@gmail.com',
        password: '123455',
      });

    expect(response.body.error).toBe('User not found');
  });

  it('is not accessible for users with no token', async () => {
    const user = await factory.create('User');

    const response = await request(app)
      .put('/users')
      .send({
        name: `${user.name}change in name`,
      });

    expect(response.body.error).toBe('Token not provided');
  });

  it('is not accessible for users with invalid token', async () => {
    const user = await factory.create('User');

    const response = await request(app)
      .put('/users')
      .set('Authorization', 'Bearer something')
      .send({
        name: `${user.name}change in name`,
      });

    expect(response.body.error).toBe('Invalid token');
  });
});
