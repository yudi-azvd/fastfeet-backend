import { Op } from 'sequelize';
import * as Yup from 'yup';

import Recipient from '../models/Recipient';

class RecipientController {
  async index(request, response) {
    const { q = '', id: recipientId = null } = request.query;
    let recipients = [];

    if (recipientId) {
      const recipient = await Recipient.findByPk(recipientId);

      return response.json(recipient);
    }

    if (q) {
      recipients = await Recipient.findAll({
        where: {
          name: { [Op.iLike]: `%${q}%` },
        },
      });
    } else {
      recipients = await Recipient.findAll();
    }

    return response.json(recipients);
  }

  async store(request, response) {
    const schema = Yup.object().shape({
      name: Yup.string().required('O nome é obrigatório'),
      street: Yup.string().required('A rua é obrigatória'),
      number: Yup.number()
        .integer('Deve ser um número')
        .min(0)
        .required('O número é obrigatório'),
      complement: Yup.string().required('O complemento é obrigatório'),
      city: Yup.string().required('A cidade é obrigatória'),
      state: Yup.string().required('O estado é obrigatório'),
      cep: Yup.string()
        .length(9, 'Siga o formato 99999-9999')
        .required('O CEP é obrigatório'),
    });

    if (!(await schema.isValid(request.body))) {
      return response.status(400).json({ error: 'Validation fails' });
    }

    const createdRecipient = await Recipient.create(request.body);

    return response.json(createdRecipient);
  }

  async update(request, response) {
    const { id: recipientId } = request.params;

    const schema = Yup.object().shape({
      name: Yup.string().required('O nome é obrigatório'),
      street: Yup.string().required('A rua é obrigatória'),
      number: Yup.number()
        .integer('Deve ser um número')
        .min(0)
        .required('O número é obrigatório'),
      complement: Yup.string().required('O complemento é obrigatório'),
      city: Yup.string().required('A cidade é obrigatória'),
      state: Yup.string().required('O estado é obrigatório'),
      cep: Yup.string()
        .length(9, 'Siga o formato 99999-9999')
        .required('O CEP é obrigatório'),
    });

    if (!(await schema.isValid(request.body))) {
      return response.status(400).json({ error: 'Validation fails' });
    }

    const recipient = await Recipient.findByPk(recipientId);

    if (!recipient) {
      return response.status(404).json({ error: 'Recipient not found' });
    }

    const {
      name,
      street,
      number,
      complement,
      city,
      state,
      cep,
    } = await recipient.update(request.body);

    return response.json({
      name,
      street,
      number,
      complement,
      city,
      state,
      cep,
    });
  }

  async delete(request, response) {
    const { id } = request.params;

    await Recipient.destroy({ where: { id } });

    return response.json({ deleted: true });
  }
}

export default new RecipientController();
