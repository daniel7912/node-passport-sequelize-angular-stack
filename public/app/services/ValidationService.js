angular.module('ValidationService', []).factory('Validation', ["$http", "$rootScope", "$location", function($http, $rootScope, $location) {

	/*****************************************************************
    ***
    *** Functions to display form validation error messages to the user
    ***
    ******************************************************************/

	return {

		registration: function(registrationFields) {
			if ( !registrationFields.username || registrationFields.username.$invalid ) {
				$rootScope.$emit('notify', { success: 0, message: "Username invalid. Please make sure username is at least 6 characters long." });
			} else if ( /\s/.test(registrationFields.username) ) {
				$rootScope.$emit('notify', { success: 0, message: "Username invalid. Please make sure username it contains no spaces." });
			} else if ( !registrationFields.email || registrationFields.email.$invalid ) {
				$rootScope.$emit('notify', { success: 0, message: "Email invalid." });
			} else if ( !registrationFields.password || registrationFields.password.$invalid ) {
				$rootScope.$emit('notify', { success: 0, message: "Password invalid. Please make sure password is at least 6 characters long." });
			} else if ( registrationFields.confirmPassword !== registrationFields.password ) {
				$rootScope.$emit('notify', { success: 0, message: "Passwords do not match." });
			}
		},

		contactForm: function(contactFields) {
			if ( !contactFields.name || contactFields.name.$invalid ) {
				$rootScope.$emit('notify', { success: 0, message: "Name is required." });
			} else if ( !contactFields.email || contactFields.email.$invalid ) {
				$rootScope.$emit('notify', { success: 0, message: "Email invalid." });
			} else if ( !contactFields.message || contactFields.message.$invalid ) {
				$rootScope.$emit('notify', { success: 0, message: "Message is required." });
			}
		}



	}

}]);