import request from 'supertest';

import app from '../../src/app';
import truncate from '../util/truncate';

import factory from '../factories';

let user;
let token;

describe('Deliveryman', () => {
  beforeEach(async () => {
    await truncate();
    user = await factory.create('User');
    token = user.generateToken();
  });

  it('should be able to be created', async () => {
    const deliveryman = await factory.attrs('Deliveryman');

    const response = await request(app)
      .post('/deliverymen')
      .set('Authorization', `Bearer ${token}`)
      .send(deliveryman);

    expect(response.body).toHaveProperty('id');
  });

  it('should have an valid email when created', async () => {
    const deliveryman = await factory.attrs('Deliveryman', {
      email: 'existingemailcom',
    });

    const response = await request(app)
      .post('/deliverymen')
      .set('Authorization', `Bearer ${token}`)
      .send(deliveryman);

    expect(response.body.error).toBe('Validation fails');
  });

  it('should not have duplicate email', async () => {
    await factory.create('Deliveryman', {
      email: 'existingemail@fastfeet.com',
    });

    const deliveryman = await factory.attrs('Deliveryman', {
      email: 'existingemail@fastfeet.com',
    });

    const response = await request(app)
      .post('/deliverymen')
      .set('Authorization', `Bearer ${token}`)
      .send(deliveryman);

    expect(response.body.error).toBe('Email already being used');
  });

  it('should list 20 deliverymen per page at max', async () => {
    await factory.createMany('Deliveryman', 21);

    const response = await request(app)
      .get('/deliverymen')
      .set('Authorization', `Bearer ${token}`);

    expect(response.body).toHaveLength(20);
  });
});
