module.exports = function(sequelize, DataTypes) {
  var Order = sequelize.define("Order", {
	order_id: {
		type: DataTypes.INTEGER,
		primaryKey: true,
		autoIncrement: true
	},
	user_id: {
		type: DataTypes.INTEGER,
		references: {
			model: 'Users',
			key: 'id'
		}
	},
	payment_type: DataTypes.STRING,
	total_price: DataTypes.DOUBLE
  });
  return Order;
};

// create table pet_order(
// 	order_id int,
//     payment_type varchar(20) check (payment_type in ('Debit', 'Credit', 'Cash', 'Check')),
// 	pickup_date date,
// 	total_price double,
//     primary key(order_id)
// );