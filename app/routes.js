var _ = require('lodash'),
	async = require('async'),
	bcrypt = require('bcrypt'),
	fs = require('fs'),
	utilities = require('./utilities.js');

module.exports = function(app, express, server, io, passport, db) {

	var router = express.Router();

	/***
	*
	* Functions to check whether or not a user is logged in
	* and redirect them if necessary
	*
	***/

	app.isLoggedIn = function(req, res, next) {

		if (req.isAuthenticated()) {
			return next();
		}

		res.redirect('/login');

	}

	app.isNotLoggedIn = function(req, res, next) {

		if (!req.isAuthenticated()) {
			return next();
		}

		res.redirect('/profile');

	}

	require('./routes-data/api-routes.js')(app, express);
	require('./routes-data/user-routes.js')(app, db, passport, utilities);

	/***
	*
	* Normal Routes
	*
	***/

	router.route('*')
		.get(function(req, res) {
			res.render('index');
		});

	app.use(router);

}