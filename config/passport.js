var LocalStrategy    = require('passport-local').Strategy;
	TwitterStrategy  = require('passport-twitter').Strategy,
	FacebookStrategy  = require('passport-facebook').Strategy,
	async = require('async'),
    validate = require('validator'),
	passport_config = require('./index.js').passport;

module.exports = function(passport, db, utilities) {

	/*****************************************************************
	***
	*** Passport Session Setup
	*** This is required for persistent login sessions
	***
	******************************************************************/

	/* Used to serialize the user for the session ********************************/
	passport.serializeUser(function(user, done) {

		var serializeData = {
			userId: user.id,
			username: user.username,
			email: user.email,
			user_rank: user.user_rank,
			facebook_id: user.facebook_id,
			twitter_id: user.twitter_id,
			generated_username: user.generated_username
		};

		done(null, serializeData);

	});

	/* Used to deserialize the user for the session ******************************/
	passport.deserializeUser(function(user, done) {
	  done(null, user);
	});

	/*****************************************************************
	***
	*** Local Login (Username/Password)
	***
	******************************************************************/

	/***
	*
	* Local Registration
	*
	***/

	passport.use('local-registration', new LocalStrategy({
			usernameField: 'username',
			passwordField: 'password',
			passReqToCallback: true
		},
		function(req, username, password, done) {

			var hashed_password;

			/* Validate registration details ********************************/

		    if (validate.isLength(username, 3, 20) == false) { /* Username must be between 3 and 20 characters */
			  	return done(null, false, 'Please keep username between 3 and 20 characters.');
		    }
		    if (validate.isEmail(req.body.email) == false) { /* Make sure a typical email address is entered */
			  	return done(null, false, 'Invalid email address.');
		    }
		    if (password.length < 5) { /* Password length must be more than 5 characters */
			  	return done(null, false, 'Password must be 5 characters or more.');
		    }
		    if (password != req.body.confirmPassword) { /* Make sure both passwords match */
			  	return done(null, false, 'Passwords do not match.');
		    }

		    /* If details pass validation tests, carry on ********************************/

			async.series([
				function(callback) {

					utilities.encryptUserPassword(password, function(result) {
					hashed_password = result;
					callback();

				});

				}, function(callback) {

					/* Check if the username or email address is already present in the database */
					db.user.count({

						where: db.sequelize.or(
							{ email: req.body.email },
							{ username: username }
						)

					}).then(function(result) {

						if (result > 0) {

							/* If the username or email already exists, do something here */
							return done(null, false, 'Username or email already in use.');

						} else {

							/* If the username and email address are both unused, register the user */
							db.user.create({

								username: username,
								email: req.body.email,
								password: hashed_password,
								user_rank: 'user'

							}).then(function(user) {

								/* Get the latest user details and pass them to the done function ***/
								db.user.find({where: {'username': user.username}}).then(function(user) {
									return done(null, user);
								});

							}).error(function() {

								return done(null, false, 'Unknown error. Please try again.');

							});

						}

					});

					callback();

				}

			]);

		}
	));

	/***
	*
	* Local Login
	*
	***/

	passport.use('local-login', new LocalStrategy({

	  usernameField : 'username',
	  passwordField : 'password',
	  passReqToCallback : true

	  },

	  function(req, username, password, done) {

		db.user.find({ where: {username: username}}).then(function(user) {

			/* Check user exists in database ********************************/

			if (!user) {
				return done(null, false, 'Username incorrect.');
			}

			/* Check password is correct ************************************/

			utilities.compareUserPassword(password, user.password, function(result) {

				if (result == false) {

					return done(null, false, 'Password incorrect.');

				} else {

					/* If user exists and password is correct, log them in **********/
					return done(null, user);

				}
			});



		});

	  }

	));

	/*****************************************************************
	***
	*** Facebook Login
	***
	******************************************************************/

	passport.use(new FacebookStrategy({
			clientID: passport_config.facebook.clientID,
			clientSecret: passport_config.facebook.clientSecret,
			callbackURL: passport_config.facebook.callbackURL,
			passReqToCallback : true
		},
		function(req, accessToken, refreshToken, profile, done) {

			// First, check if user is logged in already
			if (!req.user) {

				/***
				*
				* User isn't logged in
				*
				***/

				// Now see if the user has already logged in with facebook previously
				db.user.find({
					where: {
						'facebook_id': profile.id
					}
				}).then(function(user) {

					// If the user's facebook account isn't linked to any account
		  			if (!user) {

		  				// Facebook account isn't linked to any user
						// Set up a new user account for them.

						var date = new Date();
						var passwords;
						var userData;
						var userName = profile.displayName.split(' ');

						async.series([
							function(callback) {

								utilities.generateRandomPassword(function(result) {
									passwords = result;
									callback();
								});

							},
							function(callback) {

								// Set up the user profile and then create their account
								userData = {
									username: 'VH-'+profile.id,
									password: passwords.hashed_password,
									facebook_id: profile.id,
									user_rank: 'user',
									generated_username: '1'
								};

								callback();

							}
						], function(err) {
							if (err) { console.log(err); }

							db.user
								.create(userData)
								.then(function(newUser) {
									var newUserID = newUser.dataValues.id;

									// Once the new account is created, find their user record and log them in.
									db.user
										.find(newUserID)
										.then(function(user) {
											return done(null, user);
										});

								});

						});



		  			} else {

		  				// User's facebook account is already linked to an account.
						// Log them into their account
						return done(null, user);

		  			}

		  		});

			} else {

				/***
				*
				* User is already logged in. Link facebook to their account.
				*
				***/

				db.user.find({
					where: ["id = ?", req.user.userId]
				}).then(function(User) {

					// Username isn't already in use
					User.updateAttributes({
						'facebook_id': profile.id
					})
					.then(function() {
						return done(null, User);
					});
				});

			}


		}
	));

	/*****************************************************************
	***
	*** Twitter Login
	***
	******************************************************************/

	passport.use(new TwitterStrategy({
			consumerKey: passport_config.twitter.consumerKey,
			consumerSecret: passport_config.twitter.consumerSecret,
			callbackURL: passport_config.twitter.callbackURL,
			passReqToCallback : true
		},
		function(req, token, tokenSecret, profile, done) {

			// First, check if user is logged in already
			if (!req.user) {

				/***
				*
				* User isn't logged in
				*
				***/

				// Now see if the user has already logged in with twitter previously
				db.user.find({ where: {'twitter_id': profile.id }}).then(function(user) {

					// If the user's twitter account isn't linked to any account
		  			if (!user) {

		  				// Twitter account isn't linked to any user
						// Set up a new user account for them.

						var date = new Date();
						var passwords;
						var userData;
						var userName = profile.displayName.split(' ');

						async.series([
							function(callback) {

								utilities.generateRandomPassword(function(result) {
									passwords = result;
									callback();
								});

							},
							function(callback) {

								// Set up the user profile and then create their account
								userData = {
									username: 'VH-'+profile.id,
									password: passwords.hashed_password,
									twitter_id: profile.id,
									user_rank: 'user',
									generated_username: '1'
								};

								callback();

							}
						], function(err) {
							if (err) { console.log(err); }

							db.user
								.create(userData)
								.then(function(newUser) {
									var newUserID = newUser.dataValues.id;

									// Once the new account is created, find their user record and log them in.
									db.user
										.find(newUserID)
										.then(function(user) {
											return done(null, user);
										});

								});

						});



		  			} else {

		  				// User's twitter account is already linked to an account.
						// Log them into their account
						return done(null, user);

		  			}

		  		});

			} else {

				/***
				*
				* User is already logged in. Link twitter to their account.
				*
				***/

				db.user.find({
					where: ["id = ?", req.user.userId]
				}).then(function(User) {

					// Username isn't already in use
					User.updateAttributes({
						'twitter_id': profile.id
					})
					.then(function() {
						return done(null, User);
					});
				});

			}

		}
	));

}