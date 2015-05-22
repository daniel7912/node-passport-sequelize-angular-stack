var config = {

	secretKey: 'YOUR_SECRET_KEY',

	port: 3060,

	database: {
		db_name: 'YOUR_DB_NAME',
		db_user: 'YOUR_DB_USERNAME',
		db_password: 'YOUR_DB_PASSWORD'
	},

	site: {
		url: 'http://yourdomain.com'
	},

	apis: {

	},

	passport: {
		twitter: {
			consumerKey: 'YOUR_TWITTER_CONSUMER_KEY',
			consumerSecret: 'YOUR_TWITTER_CONSUMER_SECRET',
			callbackURL: "http://yourdomain.com/auth/twitter/callback"
		},
		facebook: {
			clientID: 'YOUR_FACEBOOK_CLIENTID',
			clientSecret: 'YOUR_FACEBOOK_CLIENTSECRET',
			callbackURL: "http://yourdomain.com/auth/facebook/callback"
		}
	}

};

module.exports = config;