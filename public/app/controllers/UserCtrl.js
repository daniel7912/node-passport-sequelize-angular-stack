angular.module('UserController', []).controller('UserController', function($rootScope, $scope, User, Validation) {

	/*****************************************************************
	***
	*** Login
	***
	******************************************************************/

	$scope.submitLoginForm = function() {
		User.login($scope.username, $scope.password);
	};

	/*****************************************************************
	***
	*** Registration
	***
	******************************************************************/

	$scope.registrationFields = {};

	$scope.submitRegistrationForm = function(isValid) {

		if ( isValid == false ) {
			Validation.registration($scope.registrationFields);
		} else {
			User.register($scope.registrationFields);
		}

	};

});