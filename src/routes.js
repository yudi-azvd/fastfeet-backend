import { Router } from 'express';

import User from './app/models/User';

const router = new Router();

router.get('/', async (request, response) => {
  const user = await User.create({
    name: 'Yudi',
    email: 'yudi@gmail.com',
    password_hash: '123456',
  });

  return response.json(user);
});

export default router;
