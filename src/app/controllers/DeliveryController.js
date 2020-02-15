/* eslint-disable yoda */
import { isAfter, isBefore, parseISO, getHours } from 'date-fns';
import * as Yup from 'yup';

import NewDeliveryMail from '../jobs/NewDeliveryMail';
import Queue from '../../lib/Queue';

import Delivery from '../models/Delivery';
import Deliveryman from '../models/Deliveryman';
import Recipient from '../models/Recipient';
import File from '../models/File';

class DeliveryController {
  async store(request, response) {
    const schema = Yup.object().shape({
      deliveryman_id: Yup.number()
        .integer()
        .required('You must specify a deliveryman'),
      recipient_id: Yup.number()
        .integer()
        .required(),
      product: Yup.string().required(),
    });

    /**
     * Como faz pra não aceitar certos campos? Como
     * startDate, endDate e canceledAt
     */
    if (!(await schema.isValid(request.body))) {
      console.log(schema);
      return response.status(400).json({ error: 'Validation fails' });
    }

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

    const delivery = await Delivery.create(request.body);

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
    /**
     * endDate só faz sentido se startDate for definido
     * Além disso, endDate não deveria ser informado
     * na mesma requisição que startDate, mas não tô
     * considerando isso por agora.
     */
    const schema = Yup.object().shape({
      product: Yup.string(),
      endDate: Yup.date(),
      startDate: Yup.date(),
      // .when('endDate', (endDate, field) =>
      //   endDate ? field.required() : field
      // ),
    });

    if (!(await schema.isValid(request.body))) {
      return response.status(400).json({ error: 'Validation fails' });
    }

    const { id } = request.params;
    const { startDate, endDate } = request.body;

    const delivery = await Delivery.findByPk(id);

    if (!delivery) {
      return response.status(400).json({ error: 'Delivery not found' });
    }

    if (startDate) {
      if (isBefore(parseISO(startDate), delivery.createdAt)) {
        return response.status(400).json({
          error: 'Start date should not be before delivery creation date',
        });
      }

      const hour = getHours(parseISO(startDate));

      if (!(8 <= hour && hour <= 18)) {
        return response
          .status(400)
          .json({ error: 'Withdrawal must be done between 8h and 18h' });
      }

      delivery.startDate = startDate;
      await delivery.save();
    }

    if (endDate && delivery.startDate) {
      if (isAfter(delivery.startDate, parseISO(endDate))) {
        return response
          .status(400)
          .json({ error: 'Start date must be before end date' });
      }

      console.log('setando endDate');
      delivery.endDate = endDate;
      await delivery.save();
    }

    return response.json(delivery);
  }

  async delete(request, response) {
    const existingDelivery = await Delivery.findByPk(request.params.id);

    if (!existingDelivery) {
      return response.status(404).json({ error: 'Delivery does not exist' });
    }

    /**
     * Só deve ser cancelada uma ÚNICA vez
     */
    if (!existingDelivery.canceledAt) {
      existingDelivery.canceledAt = new Date();
      await existingDelivery.save();
      // enviar email
    }

    return response.json(existingDelivery);
  }
}

export default new DeliveryController();
