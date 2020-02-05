import request from 'supertest';

import app from '../../src/app';
import truncate from '../util/truncate';

import factory from '../factories';

describe.only('Session', () => {
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
});
