import * as Yup from 'yup';

import User from '../models/User';

class UserController {
  async store(request, response) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      email: Yup.string().required(),
      password: Yup.string().required(),
    });

    if (!(await schema.isValid(request.body))) {
      return response.status(400).json({ error: 'Validation fails' });
    }

    const existingUser = await User.findOne({
      where: { email: request.body.email },
    });

    if (existingUser) {
      return response.status(400).json({ error: 'This email is being used' });
    }

    const { id, name, email } = await User.create(request.body);

    return response.json({ id, name, email });
  }

  async update(request, response) {
    return response.json('ok');
  }
}

export default new UserController();
