import * as Yup from 'yup';

import User from '../models/User';

class UserController {
  async store(request, response) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      email: Yup.string()
        .email()
        .required(),
      password: Yup.string()
        .min(6)
        .required(),
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
    const schema = Yup.object().shape({
      name: Yup.string(),
      email: Yup.string().email(),
      oldPassword: Yup.string().min(6),
      password: Yup.string()
        .min(6)
        .when('oldPassword', (oldPassword, field) =>
          oldPassword ? field.required() : field
        ),
      confirmPassword: Yup.string().when('password', (password, field) =>
        password ? field.required().oneOf([Yup.ref('password')]) : field
      ),
    });

    if (!(await schema.isValid(request.body))) {
      return response.status(400).json({ error: 'Validation fails' });
    }

    const { email, oldPassword } = request.body;

    const user = await User.findByPk(request.userId);

    if (email && email !== user.email) {
      const existingUser = await User.findOne({
        where: { email: request.body.email },
      });

      if (existingUser) {
        return response.status(400).json({ error: 'This email is being used' });
      }
    }

    if (oldPassword && !(await user.checkPassword(oldPassword))) {
      return response
        .status(401)
        .json({ error: 'Old password does not match' });
    }

    const { id, name } = await user.update(request.body);

    return response.json({ name, email, id });
  }
}

export default new UserController();
