module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('deliveries', 'status', {
      type: Sequelize.INTEGER,
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
      allowNull: true,
    });
  },

  down: queryInterface => {
    return queryInterface.removeColumn('deliveries', 'status');
  },
};
