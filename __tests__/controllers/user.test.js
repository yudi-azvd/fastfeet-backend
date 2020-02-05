import request from 'supertest';
import bcrypt from 'bcryptjs';

import app from '../../src/app';
import truncate from '../util/truncate';

import factory from '../factories';

describe('User', () => {
  beforeEach(async () => {
    // console.log('TRUNCATE');
    await truncate();
  });

  it('should be able to regiter', async () => {
    const user = await factory.attrs('User');

    const response = await request(app)
      .post('/users')
      .send(user);

    expect(response.body).toHaveProperty('id');
  });

  it('should send a password with length greater than 6', async () => {
    // attrs funcionou ao invés de create. Não sei o motivo.
    const user = await factory.attrs('User', {
      password: '12345',
    });

    const response = await request(app)
      .post('/users')
      .send(user);

    expect(response.status).toBe(400);
  });

  it('should encrypt password when new user is created', async () => {
    const user = await factory.create('User', {
      password: '123456',
    });

    const compareHash = await bcrypt.compare('123456', user.password_hash);

    expect(compareHash).toBe(true);
  });

  it('should not be able to create an account with used email', async () => {
    const user = await factory.attrs('User');

    await request(app)
      .post('/users')
      .send(user);

    const response = await request(app)
      .post('/users')
      .send(user);

    expect(response.status).toBe(400);
  });

  it('should not be able authenticate without account', async () => {
    const user = await factory.attrs('User', {
      password: '1234567',
    });

    // Eu preciso autenticar esse usuário
    const authResponse = await request(app)
      .post('/sessions')
      .send(user);

    expect(authResponse.status).toBe(401);
  });

  // it('when auth', async () => {
  //   const user = await factory.attrs('User');

  //   await factory.create('User', user);

  //   const authResponse = await request(app)
  //     .post('/sessions')
  //     .send(user);

  //   // console.log(authResponse);

  //   expect(authResponse.body).toHaveProperty('token');

  //   const { token } = authResponse.body;

  //   request(app)
  //     .set('Authorization', `Bearer ${token}`)
  //     .put('/users')
  //     .send({
  //       ...user,
  //       oldPassword: user.password,
  //       password: '123456',
  //       confirmPassword: '123456',
  //     })
  //     .expect(updateResponse.body)
  //     .toHaveProperty('name');

  //   // console.log(user);
  // });
});

/**
 * Pra setar o token no cabeçalho da requisição:
 * api.defaults.headers.Authorization = `Bearer ${token}`;
 */
// describe('User when authenticated', async () => {
//   beforeEach(async () => {
//     console.log('TRUNCATE');
//     await truncate();
//   });

// let token = null
// beforeAll(async () => {
//   token = response.data.token
// })

//   const user = await factory.attrs('User');

//   await factory.create('User', user);

//   const authResponse = await request(app)
//     .post('/sessions')
//     .send(user);

//   expect(authResponse.data).toHaveProperty('token');

//   console.log(authResponse.token);
// });
