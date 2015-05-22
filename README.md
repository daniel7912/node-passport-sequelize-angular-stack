# node-passport-sequelize-angular-stack
A starting point for an app using node, passport, sequelize, angular.

<h2>Installation</h2>

Clone this repository, then run npm install in the directory to grab the required npm modules.

<h2>About this repo</h2>

This repository is intended to be used as a starting point for building a web app. It contains a basic setup including:

1. Login / Registration system using Passport js, both locally & using Facebook/Twitter
2. User profile updates
3. Some form validation e.g. checking that a user chooses a username with a minimum 6 characters
4. Bootstrap (v3.3.4 at the time of writing). SASS files included.
5. Socket.io
6. Some middleware to check whether the user is logged in or not before running routes
7. Basic API setup in app/routes-data/api-routes.js to build upon.
8. Sequelize for database.
9. Global config file to add your database settings etc
10. Angular front end with authentication checks on routes.
11. Notification directive in Angular. By calling $rootScope.$emit('notify', { success: false, message: 'Display this message'}); a bootstrap alert box will appear. 'alert-danger' if success is false, 'alert-success' is success is true.
