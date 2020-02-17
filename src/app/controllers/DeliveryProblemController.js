import * as Yup from 'yup';

import Delivery from '../models/Delivery';
import DeliveryProblem from '../models/DeliveryProblem';

class DeliveryProblemController {
  async store(request, response) {
    const schema = Yup.object().shape({
      description: Yup.string().required(),
    });

    if (!(await schema.isValid(request.body))) {
      return response.status(400).json({ error: 'Validation fails' });
    }

    const deliveryId = request.params.id;
    const existingDelivery = await Delivery.findByPk(deliveryId);

    if (!existingDelivery) {
      return response.json({ error: 'Delivery not found' });
    }

    const { id, description } = await DeliveryProblem.create({
      ...request.body,
      delivery_id: deliveryId,
    });

    return response.json({ id, description });
  }

  async index(request, response) {
    const deliveryId = request.params.id;

    const existingDelivery = await Delivery.findByPk(deliveryId);

    if (!existingDelivery) {
      return response.status(404).json({ error: 'Delivery not found' });
    }

    const deliveryProblems = await DeliveryProblem.findAll({
      where: { delivery_id: deliveryId },
    });

    return response.json(deliveryProblems);
  }
}

export default new DeliveryProblemController();
