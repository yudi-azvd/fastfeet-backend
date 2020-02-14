import Delivery from '../models/Delivery';
import Deliveryman from '../models/Deliveryman';
import Recipient from '../models/Recipient';
import File from '../models/File';

class DeliveryController {
  async store(request, response) {
    // deve ser associada o recipient e ao deliveryman
    // essas duas chaves deveriam ser obrigatórias?

    const existingDeliveryman = await Deliveryman.findByPk(
      request.body.deliveryman_id
    );

    if (!existingDeliveryman) {
      return response.status(404).json({ error: 'Deliveryman does not exist' });
    }

    const existingRecipient = await Recipient.findByPk(
      request.body.recipient_id
    );

    if (!existingRecipient) {
      return response.status(404).json({ error: 'Recipient does not exist' });
    }

    const delivery = await Delivery.create(request.body, {
      include: [
        {
          model: Deliveryman,
          as: 'deliveryman',
        },
        {
          model: File,
          as: 'signature',
        },
      ],
    });

    return response.json(delivery);
  }

  async index(request, response) {
    const deliveries = await Delivery.findAll({
      include: [
        {
          model: Deliveryman,
          as: 'deliveryman',
        },
        {
          model: File,
          as: 'signature',
        },
        {
          model: Recipient,
          as: 'recipient',
        },
      ],
    });

    return response.json(deliveries);
  }

  async update(request, response) {
    const { id } = request.params;
    const { startDate, endDate } = request.body;

    const delivery = await Delivery.findByPk(id);

    if (startDate) {
      // do something
    }

    return response.json(delivery);
  }
}

export default new DeliveryController();
