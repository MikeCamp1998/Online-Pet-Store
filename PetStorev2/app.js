 var express = require("express");
var bodyParser = require("body-parser");
var session = require("express-session");
var app = express();
var flash = require("connect-flash");
var faker = require("faker");
var mysql = require("mysql");
var methodOverride =require("method-override");
const path = require('path');	//creation of paths
var db = require("./models");
var passport = require("./config/passport");
var isAuthenticated = require("./config/middleware/isAuthenticated");

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.use(flash());

app.use(session({ secret: "secret", resave: true, saveUninitialized: true}));
app.use(passport.initialize());
app.use(passport.session());

app.use(function(req, res, next){
	res.locals.currentUser = req.user;
	res.locals.error = req.flash("error");
	res.locals.success = req.flash("success");
	next();
});

///
////////////////////////////////////
//        HOMEPAGE ROUTES         //
////////////////////////////////////

app.get("/", function(req, res){
	res.render("home");
});

app.get('/about', function(req, res) {
   res.render('about', { });
});

app.get('/contact', function(req, res) {
   res.render('contact', { });
});

//////////////////////////////////
//         PETS ROUTES          //
//////////////////////////////////

//INDEX route
app.get('/pets', function(req, res) {
	//Get all pets from DB
	db.Pet.findAll().then(pets => {
		res.render("pets/index", {pets: pets});
	});
});

//SHOW route
app.get("/pets/:id", function(req, res){
	db.Pet.findAll({
		where: {
			pet_id: req.params.id
		}
	}).then(pet => {
		console.log(pet[0].pet_name);
		res.render("pets/show", {pet: pet});
	});
});

/////////////////////////////
//       CART ROUTES       //
/////////////////////////////

app.get("/cart/:id", isAuthenticated, function(req, res){
	//want to find all items in cart that belong to the current user id
	//for each item we have to find pet details from pet_id
	//load those details onto cart page
	var pets_in_cart = [];
	db.Cart.findAll({
		attributes: ['pet_id'],
		where: {
			user_id: req.params.id
		}
	}).then(items => {
		if (items.length == 0) {
			res.render("cart", {pets_in_cart: pets_in_cart});
		} else {
			items.forEach(function(item, idx, array){
				db.Pet.findAll({
					where: {
						pet_id: item.pet_id
					}
				}).then(pet => {
					pets_in_cart.push(pet[0].dataValues);
					if (idx === array.length - 1){ 
						res.render("cart", {pets_in_cart: pets_in_cart});
					}
				});
			});
		}
	}).catch(function(err){
		req.flash("error", err.message);
		res.redirect("back");
	});
});

app.post("/cart/:user_id/:pet_id", isAuthenticated, function(req, res){
	//insert action into the Carts table
	//then change In_stock attribute for added pet to False
	db.Pet.update(
		{in_stock: false},
		{where: {pet_id: req.params.pet_id}}
	);
	
	db.Cart.create({
		pet_id: req.params.pet_id,
		user_id: req.params.user_id
	}).then(function(){
		req.flash("success", "Added to Cart");
		res.redirect("/");
	});
});

app.delete("/cart/:user_id/:pet_id", isAuthenticated, function(req, res){
	db.Pet.update(
		{in_stock: true},
		{where: {pet_id: req.params.pet_id}}
	);
	
	db.Cart.destroy({
		where: {
			pet_id: req.params.pet_id,
			user_id: req.params.user_id
		}
	}).then(function(){
		req.flash("success", "Removed from Cart");
		res.redirect("back");
	});
});

/////////////////////////////
//       ORDER ROUTES      //
/////////////////////////////

app.get("/order", isAuthenticated, function(req, res) {
	res.render("order");
});

app.post("/order/:user_id", isAuthenticated, function(req, res){
	//when order is placed, have to add the information to order table
	//also needs to remove any pets from Pet table that have been purchased
	var total_price = 0;
	db.Cart.findAll({
		attributes: ['pet_id'],
		where: {
			user_id: req.params.user_id
		}
	}).then(items => {
		items.forEach(function(item, idx, array){
			db.Pet.findAll({
				where: {
					pet_id: item.pet_id
				}
			}).then(pet => {
				total_price = total_price + pet[0].price;
				db.Cart.destroy({
					where: {
						pet_id: pet[0].pet_id,
						user_id: req.params.user_id
					}
				})
				db.Pet.destroy({
					where: {
					pet_id: pet[0].pet_id,
					}
				});
				if (idx === array.length - 1) { 
					db.Order.create({
						user_id: req.params.user_id,
						payment_type: req.body.payment_type,
						total_price: total_price
					}).then(function(){
						req.flash("success", "Order Placed!");
						res.redirect("/");
					});
				}
			});
		});
	});
});

/////////////////////////////
//REGISTER AND LOGIN ROUTES//
/////////////////////////////

app.get("/register", function(req, res){
	res.render("register");
});

app.post("/register", function(req, res){
	console.log(req.body);
	db.User.create({
		email: req.body.email,
		password: req.body.password,
		first_name: req.body.first_name,
		last_name: req.body.last_name,
		address: req.body.address
	}).then(function(){
		res.redirect("/login");
	}).catch(function(err){
		req.flash("error", err.message);
		res.redirect("back");
	});
});

app.get("/login", function(req, res){
	res.render("login");
})

app.post("/login", passport.authenticate("local",
	{
		successRedirect: "/",
		failureRedirect: "/login"
	}), function(req, res) {
});

app.get("/logout", function(req, res){
	req.logout();
	req.flash("success", "Logged out!");
	res.redirect("/");
});

////////////////////////////////////////////////////////////
//This syncs the databases from models and starts the server

db.sequelize.sync().then(function() {
	app.listen(3000, function(){
		console.log("Server running on port 3000");
	});
});

////////////////////////////////////////////////////////////
