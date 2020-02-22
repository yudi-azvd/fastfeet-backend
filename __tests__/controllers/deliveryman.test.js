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

  it('should not be able to update non existing deliveryman', async () => {
    await factory.create('Deliveryman');

    const response = await request(app)
      .put(`/deliverymen/2`)
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Yudi', email: 'yudi@yudiyudi.com' });

    expect(response.body.error).toBe('Deliveryman not found');
  });

  it('should not be able to update deliveryman with invalid email', async () => {
    const deliveryman = await factory.create('Deliveryman');

    const response = await request(app)
      .put(`/deliverymen/${deliveryman.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Yudi', email: 'yudicom' });

    expect(response.body.error).toBe('Validation fails');
  });

  it('should not be able to change their email to an already existing email', async () => {
    await factory.create('Deliveryman', {
      email: 'existing@email.com',
    });

    const deliveryman = await factory.create('Deliveryman');

    const response = await request(app)
      .put(`/deliverymen/${deliveryman.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ email: 'existing@email.com' });

    expect(response.body.error).toBe('Email already being used');
  });

  it('should be able to be updated', async () => {
    const deliveryman = await factory.create('Deliveryman', {
      email: 'first@email.com',
    });

    const response = await request(app)
      .put(`/deliverymen/${deliveryman.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ email: 'second@email.com', name: 'Another name' });

    expect(response.body).toHaveProperty('id');
  });

  it('should be able to be deleted', async () => {
    const deliveryman = await factory.create('Deliveryman');

    const response = await request(app)
      .delete(`/deliverymen/${deliveryman.id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.body).toHaveProperty('deleted');
  });
});
