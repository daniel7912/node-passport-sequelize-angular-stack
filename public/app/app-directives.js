var appDirectives = angular.module('appDirectives', []);

appDirectives.directive('notification', function($rootScope, $timeout) {
	return {
		restrict: 'A',
		link: function(scope, element, attr) {

			var hideNotification = function() {
				$rootScope.notification.visible = false;
			};

			$rootScope.$on('notify', function(e, args) {

				if (args.success == '1') {
					element.removeClass('alert-danger').addClass('alert-success');
				} else if (args.success == '0') {
					element.removeClass('alert-success').addClass('alert-danger');
				}

				$rootScope.notification.visible = true;
				$rootScope.notification.message = args.message;

				if (args.timeout) {
					$timeout(hideNotification, args.timeout);
				}

			});

		}
	}
});