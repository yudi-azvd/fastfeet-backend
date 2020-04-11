module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert(
      'delivery_problems',
      [
        {
          description: 'Entregador sofreu acidente',
          delivery_id: 1,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          description: 'Produto quebrado',
          delivery_id: 2,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          description: 'Produto extraviado',
          delivery_id: 2,
          created_at: new Date(),
          updated_at: new Date(),
        },
      ],
      {}
    );
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('delivery_problems', null, {});
  },
};
