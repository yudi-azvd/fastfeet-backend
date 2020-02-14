module.exports = {
  up: (queryInterface, Sequelize) => {
    /*
      Add altering commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      */
    return queryInterface.bulkInsert(
      'recipients',
      [
        {
          name: 'John Doe',
          street: 'Baker street',
          number: 1,
          complement: 'in front of a parking lot',
          state: 'Virginia',
          city: 'São jośe dos Rios Verdes',
          cep: '72499-899',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          name: 'Jane Doe',
          street: 'Rua São Gonçalo',
          number: 2,
          complement: 'na frente do  poste de luz com hidrante',
          state: 'Frio de Janeiro',
          city: 'Boston',
          cep: '72499-777',
          created_at: new Date(),
          updated_at: new Date(),
        },
      ],
      {}
    );
  },

  down: queryInterface => {
    return queryInterface.bulkDelete('recipients', null, {});
  },
};
