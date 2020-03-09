import request from 'supertest';
import timekeeper from 'timekeeper';
import { setHours, setMinutes, setSeconds, setMilliseconds } from 'date-fns';

import app from '../../src/app';
import truncate from '../util/truncate';

import factory from '../factories';

let user;
let token;

let deliveryman;
let recipient;
let delivery;
let createdDeliviery;

describe('Delivery', () => {
  beforeEach(async () => {
    await truncate();
    user = await factory.create('User');
    token = user.generateToken();

    deliveryman = await factory.create('Deliveryman');
    recipient = await factory.create('Recipient');

    delivery = await factory.attrs('Delivery');
    delivery.deliveryman_id = deliveryman.id;
    delivery.recipient_id = recipient.id;

    createdDeliviery = await factory.create('Delivery', {
      deliveryman_id: deliveryman.id,
      recipient_id: recipient.id,
    });
  });

  afterEach(() => {
    timekeeper.reset();
  });

  it('should be able to be created', async () => {
    const response = await request(app)
      .post('/deliveries')
      .set('Authorization', `Bearer ${token}`)
      .send(delivery);

    expect(response.body).toHaveProperty('id');
  });

  it('should be able to be withdrawn after 8h', async () => {
    const time = new Date();
    const withdrawHour = setHours(time, 9);

    timekeeper.travel(withdrawHour);

    const response = await request(app)
      .post(`/deliveries/${createdDeliviery.id}/withdrawal`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.body.withdrawn).toBe(true);
  });

  it('should be able to be withdrawn before 8h or after 18h', async () => {
    const date = new Date();
    const firstAttemptWithdrawHour = setHours(date, 7);
    timekeeper.travel(firstAttemptWithdrawHour);

    const firstResponse = await request(app)
      .post(`/deliveries/${createdDeliviery.id}/withdrawal`)
      .set('Authorization', `Bearer ${token}`);

    expect(firstResponse.body.error).toBe(
      'Withdrawal must be done between 8h and 18h'
    );

    const secondAttemptWithdrawHour = setHours(date, 19);
    timekeeper.travel(secondAttemptWithdrawHour);

    const secondResponse = await request(app)
      .post(`/deliveries/${createdDeliviery.id}/withdrawal`)
      .set('Authorization', `Bearer ${token}`);

    expect(secondResponse.body.error).toBe(
      'Withdrawal must be done between 8h and 18h'
    );
  });
});
