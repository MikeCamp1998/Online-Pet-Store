module.exports = function(sequelize, DataTypes) {
  var Pet = sequelize.define("Pet", {
	pet_id: {
		type: DataTypes.INTEGER,
		primaryKey: true,
		autoIncrement: true
	},
	pet_name: DataTypes.STRING,
	pet_dob: DataTypes.DATEONLY,
	category: DataTypes.STRING,
	breed: DataTypes.STRING,
	gender: DataTypes.STRING,
	price: DataTypes.DOUBLE,
	in_stock: DataTypes.BOOLEAN,
	description: DataTypes.STRING,	//added
	image_url: DataTypes.STRING
  });
  return Pet;
};

