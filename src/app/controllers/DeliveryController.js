/* eslint-disable yoda */
import { isAfter, isBefore, parseISO, getHours } from 'date-fns';
import * as Yup from 'yup';

import NewDeliveryMail from '../jobs/NewDeliveryMail';
import CancelledDeliveryMail from '../jobs/CancelledDeliveryMail';
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
    let deliveries;
    const deliverymanId = request.params.id;

    if (deliverymanId) {
      deliveries = await Delivery.findAll({
        where: { canceledAt: null, endDate: null },
      });
    } else {
      deliveries = await Delivery.findAll({
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
    }

    return response.json(deliveries);
  }

  async update(request, response) {
    /**
     * endDate só faz sentido se startDate for definido
     * Além disso, endDate não deveria ser informado
     * na mesma requisição que startDate, mas não tô
     * considerando isso por agora.
     *
     * Na vdd, agora to considerando que o frontend só
     * vai apertar um botão para enviar solicitar a retirada
     * e outr botão para confirmar entrega finalizada, e não
     * um formulário.
     *
     * Mas e se a entrega já estiver cancelada? O que fazer?
     * - passar reto?
     * - passar um erro?
     */
    const schema = Yup.object().shape({
      product: Yup.string(),
      endDate: Yup.date(),
      startDate: Yup.date(),
      // Eu teria que não deixar que canceledAt fosse enviado
    });

    if (!(await schema.isValid(request.body))) {
      return response.status(400).json({ error: 'Validation fails' });
    }

    const { id } = request.params;
    const { startDate, endDate } = request.body;

    const delivery = await Delivery.findByPk(id);

    // if (delivery.canceledAt) ???

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
    } else if (endDate && delivery.startDate) {
      if (isAfter(delivery.startDate, parseISO(endDate))) {
        return response
          .status(400)
          .json({ error: 'Start date must be before end date' });
      }

      delivery.endDate = endDate;
      await delivery.save();
    } else {
      return response.status(400).json({
        error:
          'End date only makes sense when start date has been previously set',
      });
    }

    return response.json(delivery);
  }

  async delete(request, response) {
    const existingDelivery = await Delivery.findByPk(request.params.id, {
      attributes: ['product', 'id'],
      include: [
        {
          model: Deliveryman,
          as: 'deliveryman',
          attributes: ['name', 'email'],
        },
        {
          model: Recipient,
          as: 'recipient',
          attributes: ['name'],
        },
      ],
    });

    if (!existingDelivery) {
      return response.status(404).json({ error: 'Delivery does not exist' });
    }

    /**
     * Só deve ser cancelada uma ÚNICA vez
     */
    if (!existingDelivery.canceledAt) {
      existingDelivery.canceledAt = new Date();
      await existingDelivery.save();
      await Queue.add(CancelledDeliveryMail.key, {
        delivery: existingDelivery,
      });
    }

    return response.json(existingDelivery);
  }
}

export default new DeliveryController();
