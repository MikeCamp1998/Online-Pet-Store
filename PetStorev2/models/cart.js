 module.exports = function(sequelize, DataTypes) {
  var Cart = sequelize.define("Cart", {
	cart_id: {
		type: DataTypes.INTEGER,
		primaryKey: true,
		autoIncrement: true
	},
	pet_id: {
		type: DataTypes.INTEGER,
		references: {
			model: 'Pets',
			key: 'pet_id'
		}
	},
	user_id: {
		type: DataTypes.INTEGER,
		references: {
			model: 'Users',
			key: 'id'
		}
	}
  });
  return Cart;
};

	// customer_id int,
	// order_id int,
	// pet_id int,