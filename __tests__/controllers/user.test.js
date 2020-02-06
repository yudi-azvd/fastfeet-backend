import request from 'supertest';
import bcrypt from 'bcryptjs';

import app from '../../src/app';
import truncate from '../util/truncate';

import factory from '../factories';

let token;

describe.skip('User', () => {
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

  /**
   * UPDATE method
   */
  describe('when authenticated', () => {
    it('must provide password, old password and confirm password', async () => {
      const user = await factory.create('User');

      const authResponse = await request(app)
        .post('/sessions')
        .send({
          email: user.email,
          password: user.password,
        });

      expect(authResponse.body).toHaveProperty('token');

      token = authResponse.body.token;

      const updateResponse = await request(app)
        .put('/users')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: user.name,
          email: user.email,
          oldPassword: user.password,
          password: '123456',
          confirmPassword: '123456',
        });

      expect(updateResponse.body).toHaveProperty('name');
    });

    it('must confirm password when change password', async () => {
      const user = await factory.create('User');

      const authResponse = await request(app)
        .post('/sessions')
        .send({
          email: user.email,
          password: user.password,
        });

      expect(authResponse.body).toHaveProperty('token');

      token = authResponse.body.token;

      const updateResponse = await request(app)
        .put('/users')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: user.name,
          email: user.email,
          oldPassword: user.password,
          password: '123456',
        });

      expect(updateResponse.status).toBe(400);
    });

    it('must change email to a email which is not already taken', async () => {
      // const firstUser = await factory.attrs('User');
      // const user = await factory.attrs('User');
      // const [firstUser, user] = await factory.createMany('User', 2);
      // const [firstUser, user] = await factory.buildMany('User', 2);
      // console.log(firstUser.email, user.email);
      // const authResponse = await request(app)
      //   .post('/sessions')
      //   .send({
      //     email: user.email,
      //     password: user.password,
      //   });
      // expect(authResponse.body).toHaveProperty('token');
      // token = authResponse.body.token;
      // const updateResponse = await request(app)
      //   .put('/users')
      //   .set('Authorization', `Bearer ${token}`)
      //   .send({
      //     name: user.name,
      //     email: firstUser.email,
      //   });
      // expect(updateResponse.status).toBe(400);
      // expect(updateResponse.body).toBe(400);
    });

    it('change name with no need to inform password stuff', async () => {
      const user = await factory.create('User');

      const authResponse = await request(app)
        .post('/sessions')
        .send({
          email: user.email,
          password: user.password,
        });

      expect(authResponse.body).toHaveProperty('token');

      token = authResponse.body.token;

      const updateResponse = await request(app)
        .put('/users')
        .set('Authorization', `Bearer ${token}`)
        .send({
          // ...user,
          name: `${user.name}Different Name`,
          email: user.email,
        });

      expect(updateResponse.body).toHaveProperty('name');
    });
  });
});
