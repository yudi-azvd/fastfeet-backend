import Sequelize, { Model } from 'sequelize';

class Recipient extends Model {
  static init(sequelize) {
    super.init(
      {
        name: Sequelize.STRING,
        email: Sequelize.STRING,
        startDate: Sequelize.DATE,
        endDate: Sequelize.DATE,
        canceledAt: Sequelize.DATE,
      },
      {
        sequelize,
      }
    );

    return this;
  }
}

export default Recipient;
