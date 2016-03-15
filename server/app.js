var path = require('path');
var user = require('./routes/user');
var logger = require('morgan');
var express = require('express');
var favicon = require('serve-favicon');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var projectlog = require('./routes/projectlog');
var cookieParser = require('cookie-parser');
var OAuthService = require('./routes/auth2');

(function PathwayServer() {

  var app;
  var baseUrl = '/pathway/api';
  var databaseUrl = 'mongodb://localhost/pathway';

  // api configuration
  var apis = {
    '/projectlog': projectlog.router,
    '/user': user.router
  };

  function connectToDB() {
    mongoose.connect(databaseUrl, function(error) {
      if (error) {
        throw ('Connect to mongodb: ' + error);
      }

      console.log('Connect to mongodb: successful [' + databaseUrl + ']');
    });
  }

  function setupAPI() {
    app = express();
    app.use(require('serve-static')(__dirname + '/../build'));
    app.use(logger('dev'));
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({
      extended: true
    }));
    app.use(cookieParser());
  }

  function enableCORS() {
    app.use(function(req, res, next) {
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
      res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
      next();
    });
  }

  function setupAuth() {
    app.oauth = new OAuthService(app, baseUrl + '/oauth');
  }

  function registerAPIs() {
    for (var api in apis) {
      app.use(baseUrl + api, apis[api]);
      console.log('registered: ', api);
    }
  }

  function handle404() {
    // catch 404 and forward to error handler
    app.use(function(req, res, next) {
      res.status(404);
      res.json({
        status: 404,
        message: 'Requested URL is invalid!'
      });
    });
  }

  // error handlers
  function handle500() {
    // development error handler and this will print stacktrace
    // @if isDev
    app.use(function(error, req, res, next) {
      res.status(error.status || 500);
      res.json({
        message: error.message,
        error: error
      });
    });
    // @endif

    // production error handler and this will not leake stacktraces to user
    // @if isProd
    app.use(function(error, req, res, next) {
      res.status(error.status || 500);
      res.json({
        message: error.message
      });
    });
    // @endif
  }

  // startup this module and export
  connectToDB();
  setupAPI();
  enableCORS();
  setupAuth();
  registerAPIs();
  handle404();
  handle500();

  // export module
  module.exports = app;

})(this);