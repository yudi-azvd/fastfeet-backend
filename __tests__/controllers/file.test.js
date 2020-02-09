import request from 'supertest';

import app from '../../src/app';
import factory from '../factories';
import truncate from '../util/truncate';

describe('File', () => {
  beforeEach(async () => {
    await truncate();
  });

  it('should be able to be uploaded', async () => {
    const user = await factory.create('User');
    const token = user.generateToken();

    const response = await request(app)
      .post('/files')
      .set('Authorization', `Bearer ${token}`)
      // .field('file', 'wtf')
      .attach('file', `${__dirname}/imgs/perfil.png`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('url');
  });
});
