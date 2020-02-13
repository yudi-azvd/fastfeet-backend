module.exports = {
  up: QueryInterface => {
    return QueryInterface.bulkInsert(
      'deliverymans',
      [
        {
          name: 'Entregador Um',
          email: 'entreg@um.com',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          name: 'Entregador Dois',
          email: 'entreg@dois.com',
          created_at: new Date(),
          updated_at: new Date(),
        },
      ],
      {}
    );
  },

  down: QueryInterface => {
    return QueryInterface.bulkDelete('deliverymans', {
      email: ['entreg@um.com', 'entreg@dois.com'],
    });
  },
};
