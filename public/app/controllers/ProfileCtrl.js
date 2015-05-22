angular.module('ProfileController', []).controller('ProfileController', ["$scope", "$rootScope", "User", function($scope, $rootScope, User) {

	$scope.profileData = {
		email: $rootScope.loggedInUser.email
	};

	$scope.changeUsername = function() {

	};

	$scope.updateProfile = function() {

		var updateData = {};

		/*****************************************************************
	    ***
	    *** Check whether the user has entered data into the password fields
	    *** If they have, passwords must be at least 6 characters in length
	    *** Also check that the new password has been confirmed.
	    ***
	    ******************************************************************/

		if ( $scope.profileData.currentPassword ) {
			if ( $scope.profileData.newPassword && $scope.profileData.confirmNewPassword && $scope.profileData.newPassword == $scope.profileData.confirmNewPassword ) {
				if ( $scope.profileData.newPassword.length > 5 ) {
					User.updateProfile($scope.profileData);
				} else {
					$rootScope.$emit('notify', { success: 0, message: "Passwords must be 6 or more characters." });
				}
			} else {
				$rootScope.$emit('notify', { success: 0, message: "New passwords do not match and/or are not 6 or more characters long." });
			}

		} else {
			User.updateProfile({
				email: $scope.profileData.email
			});
		}
	};

}]);