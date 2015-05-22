/*****************************************************************
***
*** Module Dependencies
***
******************************************************************/

var express = require('express'),
    session = require('express-session'),
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser'),
    flash = require('connect-flash'),
    app = express(),
  	http = require('http'),
    server = http.createServer(app),
  	path = require('path'),
    passport = require('passport'),
    config = require('./config'),
    db = require('./app/models'),
    Sequelize = require('sequelize'),
    io = require('socket.io')(server);

/* Configure Express Application ******************************************/

// all environments
app.set('port', process.env.PORT || config.port);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(express.static('public'));
app.use(cookieParser());
app.use(session({
  secret: config.secretKey,
  resave: true,
  saveUninitialized: true
}))
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

/* Get the routes ********************************************************/
require('./app/routes.js')(app, express, server, io, passport, db);

/*****************************************************************
***
*** Sync the database before starting the express server
***
******************************************************************/

db.sequelize.sync().then(function() {

  server.listen(app.get('port'), function(){
    console.log('Express server listening on port ' + app.get('port'));
  });

});