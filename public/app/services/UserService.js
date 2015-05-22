angular.module('UserService', []).factory('User', function($http, $rootScope, $location) {

	return {

		login: function(username, password) {
			$http.post('/login', {
				username: username,
				password: password
			}).success(function(data) {
				if (data.success == true) {
					$rootScope.loggedInUser = data.user;
					$rootScope.notification.visible = false;
					$location.path('/');
				} else {
					$rootScope.$emit('notify', data);
				}
			}).error(function() {
				$rootScope.$emit('notify', { success: 0, message: "Something went wrong. Please try again." });
			});
		},

		register: function(registrationFields) {
			$http.post('/register', registrationFields).success(function(data) {
				if (data.success == true) {
					$rootScope.loggedInUser = data.user;
					$location.path('/welcome');
				} else {
					$rootScope.$emit('notify', data);
				}
			});
		},

		forgotPassword : function(email) {
			$http.post('/forgot-password', {
				email: email
			}).success(function(data) {
				$rootScope.$emit('notify', data);
			});
		},

		resetPassword : function(resetKey, email, newPassword) {
			$http.post('/reset-password', {
				resetKey: resetKey,
				email: email,
				newPassword: newPassword
			}).success(function(data) {
				$rootScope.$emit('notify', data);
			});
		},

		changeUsername: function(newUsername) {
			$http.post('/change-username', {
				newUsername: newUsername
			}).success(function(data) {
				$rootScope.$emit('notify', data);
			});
		},

		updateProfile: function(profileData) {
			$http.post('/update-profile', profileData).success(function(data) {
				$rootScope.$emit('notify', data);
			});
		}

	}

});