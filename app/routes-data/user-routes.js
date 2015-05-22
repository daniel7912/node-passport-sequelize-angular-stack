/*****************************************************************
***
*** User related routes
***
******************************************************************/

module.exports = function(app, db, passport, utilities) {

	// Test whether user is logged in or not
	app.get('/loggedin', function(req, res) {
		res.send(req.isAuthenticated() ? req.user : '0');
	});

	// Login methods are stored in config/passport.js
	require('../../config/passport')(passport, db, utilities);

	/*****************************************************************
	***
	*** LOGIN / LOGOUT
	***
	******************************************************************/

	app.post('/login', function(req, res, next) {

		passport.authenticate('local-login', function(err, user, info) {
			if (err) {
				return next(err);
			}
			if (!user) {
				return res.send({ success: false, message: 'Incorrect username or password.' });
			}

			req.login(user, function(err) {
				if (err) { return next(err); }
				return res.send({ success: true, message: 'Authentication succeeded', user: user });
			});
		})(req, res, next);

	});

	app.post('/logout', function(req, res) {
		req.logout();
		res.sendStatus(200);
	});

	/*****************************************************************
	***
	*** REGISTRATION
	***
	******************************************************************/

	app.post('/register', function(req, res, next) {

		passport.authenticate('local-registration', function(err, user, info) {
			if (err) {
				return next(err);
			}
			if (!user) {
				return res.send({ success: false, message: info });
			}

			req.login(user, function(err) {
				if (err) { return next(err); }
				return res.send({ success: true, message: 'Registration succeeded', user: user });
			});
		})(req, res, next);

	});

	/*****************************************************************
	***
	*** FACEBOOK LOGIN / REGISTRATION
	***
	******************************************************************/

	app.get('/auth/facebook', passport.authenticate('facebook'));

	app.get('/auth/facebook/callback', function(req, res, next) {

		passport.authenticate('facebook', function(err, user, info) {
			if (err) {
				return next(err);
			}
			if (!user) {
				return res.send({ success: false, message: info });
			}

			req.login(user, function(err) {
				if (err) { return next(err); }
				res.redirect('/lobbies');
			});
		})(req, res, next);

	});

	app.delete('/auth/facebook', function(req, res) {

		db.user.find({
			where: {
				id: req.user.userId
			}
		}).then(function(User) {

			return User.updateAttributes({
				facebook_id: null
			});

		}).then(function() {
			res.send({ success: true, message: 'Facebook unlinked successfully' });
		});

	});

	/*****************************************************************
	***
	*** FORGOT PASSWORD
	***
	******************************************************************/

	app.post('/forgot-password', function(req, res) {

		utilities.generateRandomString(20, function(forgotPasswordString) {

			db.user.find({
				where: ["email = ?", req.body.email]
			}).then(function(User) {

				if (!User) {

					res.json({ message: 'Email not registered. Did you register via Facebook or Twitter?', success: '0' });

				} else {

					User.updateAttributes({
						forgot_password: forgotPasswordString
					}).then(function() {

						emails.forgotPassword(forgotPasswordString, req.body.email, function() {
							res.json({ message: 'Email sent. Please check your inbox.', success: '1' });
						});

					});

				}

			});

		});

	});

	app.post('/reset-password', function(req, res) {

		bcrypt.genSalt(10, function(err, salt) {

			bcrypt.hash(req.body.newPassword, salt, function(err, hashed_password) {

				db.user.find({
					where: Sequelize.and({
						email: req.body.email,
						forgot_password: req.body.resetKey
					})
				}).then(function(User) {

					if (!User) {
						res.json({ message: 'Details are incorrect.', success: '0' });
					}

					User.updateAttributes({
						password: hashed_password
					}).then(function() {
						res.json({ message: 'Password reset successfully.', success: '1', stayOnScreen: true });
					});

				});

			});

		});

	});

	/*****************************************************************
	***
	*** PROFILE PAGE - CHANGE USERNAME & UPDATE PROFILE
	***
	******************************************************************/

	app.post('/change-username', app.isLoggedIn, function(req, res) {

		// Check if the user has an auto generated username
		if (req.session.passport.user.generated_username == '1') {

			var newUsername = req.body.newUsername;

			db.user.find({
				where: ["username = ?", newUsername]
			}).then(function(user) {

				if (!user) {

					// Username isn't already in use
					db.user.find({
						where: ["username = ?", req.session.passport.user.username]
					}).then(function(User) {

						User.updateAttributes({
							'username': newUsername,
							'generated_username': '0'
						})
							.then(function() {
								req.session.passport.user.username = newUsername;
								req.session.passport.user.generated_username = '0';
								res.json({message: 'Username changed successfully.', success: '1'});
							});

						});

				} else {
					res.json({message: 'Username already in use.', success: '0'});
				}

			});
		} else {
			res.json({message: 'You cannot change your username.', success: '0'})
		}

	});

	app.post('/update-profile', app.isLoggedIn, function(req, res) {

		var formData = req.body;

		db.user.find({
			where: ["id = ?", req.session.passport.user.userId]
		}).then(function(User) {

			async.series([

				function(callback) {

					if (formData.currentPassword && formData.newPassword && formData.confirmNewPassword) {

						utilities.compareUserPassword(formData.currentPassword, User.password, function(result) {

							if (result == false) {
								// User has entered the wrong password, exit with error
								res.json({message: 'Incorrect password.', success: '0'});
							} else {
								// User has entered the correct password, check the 2 new passwords match
								// and then encrypt their new one
								if (formData.newPassword != formData.confirmNewPassword) {
									res.json({message: 'New passwords do not match. Please try again.', success: '0'});
								} else {
									utilities.encryptUserPassword(formData.newPassword, function(result) {
										// Replace old password with new one before we update
										formData.password = result;
										callback();
									});
								}
							}

						});

					} else {
						// User isn't updating password so remove these variables and just carry on
						delete formData.currentPassword;
						delete formData.newPassword;
						delete formData.confirmNewPassword;
						callback();
					}

				}

			], function(err, results) {

				User.updateAttributes(formData)
					.then(function() {
						// Update session variables and then notify the user of success
						req.session.passport.user.email = formData.email;
						res.json({message: 'Profile updated successfully.', success: '1'});
					});

			});

		});

	});

}