import faker from 'faker';
import { factory } from 'factory-girl';

import User from '../src/app/models/User';

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

export default factory;
