/* eslint-disable yoda */
import { Op } from 'sequelize';
import {
  isAfter,
  isBefore,
  parseISO,
  getHours,
  setHours,
  setMinutes,
  setSeconds,
  setMilliseconds,
} from 'date-fns';
import * as Yup from 'yup';

import NewDeliveryMail from '../jobs/NewDeliveryMail';
import CancelledDeliveryMail from '../jobs/CancelledDeliveryMail';
import Queue from '../../lib/Queue';

import Delivery from '../models/Delivery';
import DeliveryProblem from '../models/DeliveryProblem';
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
    const { delivered = false } = request.query;
    const deliverymanId = request.params.id;
    /**
     * Além disso eu teria que remover os campos
     * createdAt e updatedAt
     */
    const include = [
      {
        model: Deliveryman,
        as: 'deliveryman',
        attributes: ['id', 'name', 'email'],
      },
      {
        model: File,
        as: 'signature',
      },
      {
        model: Recipient,
        as: 'recipient',
      },
    ];

    if (deliverymanId && delivered) {
      deliveries = await Delivery.findAll({
        where: { endDate: { [Op.ne]: null }, deliveryman_id: deliverymanId },
        include,
      });
    } else if (deliverymanId) {
      deliveries = await Delivery.findAll({
        where: {
          canceledAt: null,
          endDate: null,
          deliveryman_id: deliverymanId,
        },
        include,
      });
    } else {
      deliveries = await Delivery.findAll({
        include,
      });
    }

    return response.json(deliveries);
  }

  async update(request, response) {
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

    const delivery = await Delivery.findByPk(id, {
      include: [
        {
          model: Deliveryman,
          as: 'deliveryman',
        },
      ],
    });

    if (!delivery) {
      return response.status(400).json({ error: 'Delivery not found' });
    }

    const FIRST_HOUR_OF_DAY = 8;
    const LAST_HOUR_OF_DAY = 18;

    if (request.path.endsWith('/withdrawal')) {
      const deliverymanId = delivery.deliveryman.id;
      const currentDate = new Date();
      const currentDateInitialHours = setMilliseconds(
        setSeconds(
          setMinutes(setHours(currentDate, FIRST_HOUR_OF_DAY, 0), 0),
          0
        ),
        0
      );

      if (delivery.startDate) {
        return response
          .status(403)
          .json({ error: 'Delivery cannot be withdrawn again' });
      }

      const deliveriesFromToday = await Delivery.findAll({
        where: {
          deliveryman_id: deliverymanId,
          startDate: { [Op.between]: [currentDateInitialHours, currentDate] },
        },
        limit: 6,
      });

      if (deliveriesFromToday.length >= 5) {
        return response
          .status(403)
          .json({ error: 'Deliveryman can only make 5 withdrawals per day' });
      }

      const hour = getHours(currentDate);

      if (!(FIRST_HOUR_OF_DAY <= hour && hour <= LAST_HOUR_OF_DAY)) {
        return response
          .status(400)
          .json({ error: 'Withdrawal must be done between 8h and 18h' });
      }

      // delivery.startDate = currentDateInitialHours;
      delivery.startDate = currentDate;
      await delivery.save();
      return response.json({ withdrawn: true });
    }

    if (request.path.endsWith('/delivered')) {
      if (!delivery.endDate) {
        delivery.endDate = new Date();
        await delivery.save();
        return response.redirect(307, '/files');
      }

      return response
        .status(400)
        .json({ error: 'Delivery cannot be delivered again' });
    }

    if (startDate) {
      if (isBefore(parseISO(startDate), delivery.createdAt)) {
        return response.status(400).json({
          error: 'Start date should not be before delivery creation date',
        });
      }
    }

    if (endDate) {
      if (endDate && delivery.startDate) {
        if (isAfter(delivery.startDate, parseISO(endDate))) {
          return response
            .status(400)
            .json({ error: 'Start date must be before end date' });
        }
      } else {
        return response.status(400).json({
          error:
            'End date only makes sense when start date has been previously set',
        });
      }
    }

    // if (canceledAt) ???

    await delivery.update(request.body);

    return response.json(delivery);
  }

  async delete(request, response) {
    if (request.path.endsWith('/cancel-delivery')) {
      const deliveryProblemId = request.params.id;

      const deliveryProblem = await DeliveryProblem.findByPk(
        deliveryProblemId,
        {
          include: [
            {
              model: Delivery,
              as: 'delivery',
              include: [
                {
                  model: Deliveryman,
                  as: 'deliveryman',
                },
                {
                  model: Recipient,
                  as: 'recipient',
                },
              ],
            },
          ],
        }
      );

      /**
       * Só deve ser cancelada uma ÚNICA vez
       */
      if (!deliveryProblem) {
        return response
          .status(404)
          .json({ error: 'Delivery problem not found' });
      }

      if (!deliveryProblem.delivery.canceledAt) {
        deliveryProblem.delivery.canceledAt = new Date();

        await deliveryProblem.delivery.save();
        await Queue.add(CancelledDeliveryMail.key, {
          delivery: deliveryProblem.delivery,
        });
      }

      // e se o front end quiser mostrar o horário de cancelamento?
      return response.json({ canceled: true });
    }

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

    await Delivery.destroy({ where: { id: existingDelivery.id } });

    return response.json({ deleted: true });
  }
}

export default new DeliveryController();
