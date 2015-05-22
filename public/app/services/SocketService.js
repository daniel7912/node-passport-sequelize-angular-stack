angular.module('SocketService', []).factory('Socket', function(socketFactory) {

	var Socket = socketFactory();
	Socket.forward('newMessage');
	return socketFactory();

});