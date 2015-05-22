/***
*
* Just some useful functions that can be used anywhere
*
***/

var bcrypt = require('bcrypt');

exports.generateRandomString = function(stringLength, callback) {
	var text = "";
    var possible = "abcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < stringLength; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    callback(text);
}

exports.generateRandomPassword = function(callback) {

	// This is used when signing up with facebook/twitter
	// Basically, we make a random 10 character string and then encrypt it.

	var data = {};
	var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < 10; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    bcrypt.genSalt(10, function(err, salt) {

		bcrypt.hash(text, salt, function(err, hashed_password) {

			data.plain_password = text;
			data.hashed_password = hashed_password;

			callback(data);

		});

	});;

}

exports.encryptUserPassword = function(password, callback) {

	bcrypt.genSalt(10, function(err, salt) {

		bcrypt.hash(password, salt, function(err, hashed_password) {
			callback(hashed_password);
		});

	});

}

exports.compareUserPassword = function(password, user_password, callback) {

	callback(bcrypt.compareSync(password, user_password));

}