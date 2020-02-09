import Sequelize, { Model } from 'sequelize';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

import authConfig from '../../config/auth';

class User extends Model {
  static init(sequelize) {
    super.init(
      {
        name: Sequelize.STRING,
        email: Sequelize.STRING,
        password: Sequelize.VIRTUAL,
        password_hash: Sequelize.STRING,
      },
      {
        sequelize,
      }
    );

    this.addHook('beforeSave', async user => {
      // só vai acontecer quando criarem ou editarem um usuário.
      if (user.password) {
        const saltRounds = 8;
        user.password_hash = await bcrypt.hash(user.password, saltRounds);
      }
    });

    return this;
  }

  static associate(models) {
    this.belongsTo(models.File, { foreignKey: 'avatar_id', as: 'avatar' });
  }

  checkPassword(password) {
    return bcrypt.compare(password, this.password_hash);
  }

  // Para ser usado apenas em testes.
  generateToken() {
    return jwt.sign({ id: this.get('id') }, authConfig.secret, {
      expiresIn: authConfig.expiresIn,
    });
  }
}

export default User;
