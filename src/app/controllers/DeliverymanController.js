import * as Yup from 'yup';

import Deliveryman from '../models/Deliveryman';

class DeliverymanController {
  async store(request, response) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      email: Yup.string()
        .email()
        .required(),
    });

    if (!(await schema.isValid(request.body))) {
      return response.status(400).json({ error: 'Validation fails' });
    }

    const existingDeliveryman = await Deliveryman.findOne({
      where: { email: request.body.email },
    });

    if (existingDeliveryman) {
      return response.status(400).json({ error: 'Email already being used' });
    }

    const { id, name, email } = await Deliveryman.create(request.body);

    return response.json({ id, name, email });
  }

  async index(request, response) {
    const DELIVERYMEN_PER_PAGE = 20;
    const { page = 1 } = request.query;

    const deliverymen = await Deliveryman.findAll({
      offset: (page - 1) * DELIVERYMEN_PER_PAGE,
      limit: DELIVERYMEN_PER_PAGE,
    });

    return response.json(deliverymen);
  }

  async update(request, response) {
    const { email } = request.body;

    const schema = Yup.object().shape({
      name: Yup.string(),
      email: Yup.string(),
    });

    if (!(await schema.isValid(request.body))) {
      return response.status(400).json({ error: 'Validation fails.' });
    }

    const deliveryman = await Deliveryman.findByPk(request.params.id);

    if (!deliveryman) {
      return response.status(404).json({ error: 'Deliveryman not found' });
    }

    if (email && email !== deliveryman.email) {
      const emailAlreadyUsed = Deliveryman.findOne({ where: { email } });

      if (emailAlreadyUsed) {
        return response.status(401).json({ error: 'Email already being used' });
      }
    }

    const { id, name } = await deliveryman.update(request.body);

    return response.json({ id, name, email });
  }

  async delete(request, response) {
    const { id } = request.params;

    /**
     * Fazer algumas verificações de encomendas pendentes
     */
    await Deliveryman.destroy({ where: { id } });

    return response.json({ delete: true });
  }
}

export default new DeliverymanController();
