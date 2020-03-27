import { Op } from 'sequelize';

import Recipient from '../models/Recipient';

class RecipientController {
  async index(request, response) {
    const { q = '' } = request.query;
    let recipients = [];

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
}

export default new RecipientController();
