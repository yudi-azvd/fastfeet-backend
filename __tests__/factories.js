import faker from 'faker';
import { factory } from 'factory-girl';

import User from '../src/app/models/User';
import Deliveryman from '../src/app/models/Deliveryman';

/**
 * Solução da Rocketseat
 */
// factory.define('User', User, {
//   name: faker.name.findName(),
//   email: faker.internet.email(),
//   password: faker.internet.password(),
// });

/**
 * Solução apresentada pelo doc do factory-girl
 */
factory.define('User', User, {
  name: factory.sequence('User.name', n => `User Something${n}`),
  email: factory.sequence('User.email', n => `user-${n}@gmail.com`),
  password: faker.internet.password(),
});

factory.define('Deliveryman', Deliveryman, {
  name: factory.sequence('User.name', n => `Deliveryman Something${n}`),
  email: factory.sequence('User.email', n => `deliveryman-${n}@gmail.com`),
});

export default factory;
