/* eslint-disable yoda */
import { isAfter, isBefore, parseISO, getHours } from 'date-fns';

import NewDeliveryMail from '../jobs/NewDeliveryMail';
import Queue from '../../lib/Queue';

import Delivery from '../models/Delivery';
import Deliveryman from '../models/Deliveryman';
import Recipient from '../models/Recipient';
import File from '../models/File';

class DeliveryController {
  async store(request, response) {
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
      // NÃO INCLUI
      include: [
        {
          model: Deliveryman,
          as: 'deliveryman',
        },
        {
          model: Recipient,
          as: 'recipient',
        },
        {
          model: File,
          as: 'signature',
        },
      ],
    });

    // tenho que fazer uma query a mais, putz
    const createdDelivery = await Delivery.findByPk(delivery.id, {
      include: [
        {
          model: Deliveryman,
          as: 'deliveryman',
        },
        {
          model: Recipient,
          as: 'recipient',
        },
        {
          model: File,
          as: 'signature',
        },
      ],
    });

    await Queue.add(NewDeliveryMail.key, {
      delivery: createdDelivery,
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
      if (isBefore(parseISO(startDate), delivery.createdAt)) {
        return response
          .status(400)
          .json({ error: 'Start date before delivery creation date' });
      }

      const hour = getHours(parseISO(startDate));

      console.log(getHours(parseISO(startDate)));

      if (!(8 <= hour && hour <= 18)) {
        return response
          .status(400)
          .json({ error: 'Retirada deve ser feita entre 8h e 18h' });
      }
    }

    if (endDate && startDate) {
      if (isAfter(parseISO(startDate), parseISO(endDate))) {
        return response
          .status(400)
          .json({ error: 'Start date must be before end date' });
      }
    }

    return response.json(delivery);
  }
}

export default new DeliveryController();
