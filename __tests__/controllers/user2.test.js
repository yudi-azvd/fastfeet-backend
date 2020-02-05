import supertest from 'supertest';

import app from '../../src/app';
import truncate from '../util/truncate';

import factory from '../factories';

const api = supertest(app);

// describe('User2', () => {
//   beforeEach(async () => {
//     await truncate();
//   });

//   it('when auth', async () => {
//     const user = await factory.attrs('User');

//     await factory.create('User', user);

//     const authResponse = await api.post('/sessions').send(user);

//     // console.log(authResponse);

//     expect(authResponse.body).toHaveProperty('token');

//     const { token } = authResponse.body;

//     await api
//       .set('Authorization', `Bearer ${token}`)
//       .put('/users')
//       .send({
//         ...user,
//         oldPassword: user.password,
//         password: '123456',
//         confirmPassword: '123456',
//       })
//       .expect(updateResponse.body)
//       .toHaveProperty('name');

//     // console.log(user);
//   });
// });

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
