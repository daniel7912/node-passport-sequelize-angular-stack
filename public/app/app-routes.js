angular.module('appRoutes', []).config(['$routeProvider', '$locationProvider', '$httpProvider', function($routeProvider, $locationProvider, $httpProvider) {

	/*****************************************************************
	***
	*** Check if the user is connected
	***
	******************************************************************/

	var checkLoggedIn = function($q, $timeout, $http, $window, $location, $rootScope) {
		// Initialize a new promise
		var deferred = $q.defer();

		// Make an AJAX call to check if the user is logged in
		$http.get('/loggedin').success(function(user) {

			// Authenticated
			if (user !== '0') {
				$rootScope.loggedInUser = user;
				$window.sessionStorage['loggedInUser'] = JSON.stringify(user);
				deferred.resolve();
			}

			// Not Authenticated
			else {
				$window.sessionStorage['loggedInUser'] = null;
				$rootScope.loggedInUser = null;
				deferred.reject();
				$location.url('/login');
			}
		});

		return deferred.promise;
	};
	checkLoggedIn.$inject = ["$q", "$timeout", "$http", "$window", "$location", "$rootScope"];

	var checkNotLoggedIn = function($q, $timeout, $http, $window, $location, $rootScope) {
		// Initialize a new promise
		var deferred = $q.defer();

		// Make an AJAX call to check if the user is logged in
		$http.get('/loggedin').success(function(user) {

			// Authenticated
			if (user === '0') {
				deferred.resolve();
			}

			// Not Authenticated
			else {
				$location.url('/profile');
			}
		});

		return deferred.promise;
	};
	checkNotLoggedIn.$inject = ["$q", "$timeout", "$http", "$window", "$location", "$rootScope"];

	/*****************************************************************
	***
	*** Add an interceptor for AJAX errors
	***
	******************************************************************/

	$httpProvider.interceptors.push(["$q", "$location", function($q, $location) {
		return {
			response: function(response) {
				// do something on success
				return response;
			},
			responseError: function(response) {
				if (response.status === 401) {
					$location.url('/login');
				}
				return $q.reject(response);
			}
		};
	}]);

	/*****************************************************************
	***
	*** All app routes
	***
	******************************************************************/

	$routeProvider

		.when('/', {
			title: 'Home',
			templateUrl: '/app/templates/home.html',
			controller: 'MainController'
		})

		.when('/login', {
			title: 'Login',
			templateUrl: '/app/templates/login.html',
			controller: 'UserController',
			resolve: {
				notLoggedIn: checkNotLoggedIn
			}
		})

		.when('/register', {
			title: 'Register',
			templateUrl: '/app/templates/register.html',
			controller: 'UserController',
			resolve: {
				notLoggedIn: checkNotLoggedIn
			}
		})

		.when('/profile', {
			title: 'Profile',
			templateUrl: '/app/templates/profile.html',
			controller: 'ProfileController',
			resolve: {
				loggedIn: checkLoggedIn
			}
		})

		.otherwise({
			redirectTo: '/'
		});

	$locationProvider.html5Mode(true);

}]);