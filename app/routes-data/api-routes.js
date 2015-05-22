/*****************************************************************
***
*** API routes
***
******************************************************************/

module.exports = function(app, express) {

	var router = express.Router();

	router.route('/users')
		.get(function(req, res) {

			res.send({
				message: 'Welcome to the users API'
			});

		});

	app.use('/api', router);

}