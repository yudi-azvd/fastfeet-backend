import Delivery from '../models/Delivery';
import Deliveryman from '../models/Deliveryman';
import File from '../models/File';

class DeliveryController {
  async store(request, response) {
    const del = await Delivery.create(request.body, {
      include: [
        {
          model: Deliveryman,
          as: 'deliveryman',
        },
      ],
    });

    return response.json(del);
  }

  async index(request, response) {
    const deliveries = await Delivery.findAll({
      include: [
        {
          model: Deliveryman,
          as: 'deliveryman',
        },
      ],
    });

    return response.json(deliveries);
  }
}

export default new DeliveryController();
