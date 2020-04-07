module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert(
      'deliveries',
      [
        {
          recipient_id: 1,
          deliveryman_id: 1,
          product: 'Baleia',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          recipient_id: 2,
          deliveryman_id: 1,
          product: 'Jabulani',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          recipient_id: 2,
          deliveryman_id: 1,
          start_date: new Date('2020-12-17T10:24:00'),
          product: 'Pipa',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          recipient_id: 2,
          deliveryman_id: 2,
          start_date: new Date('2020-12-17T10:24:00'),
          end_date: new Date('2020-12-20T16:24:00'),
          product: 'Pipa',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          recipient_id: 1,
          deliveryman_id: 2,
          start_date: new Date('2020-12-17T10:24:00'),
          canceled_at: new Date('2020-12-20T16:24:00'),
          product: 'Pipa',
          created_at: new Date(),
          updated_at: new Date(),
        },
      ],
      {}
    );
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('deliveries', null, {});
  },
};
