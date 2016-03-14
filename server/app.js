var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var todos = require('./routes/todos');
var baseUrl = '/pathway/api';

var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/pathway', function(err) {
  if (err) {
    console.log('Connect to mongodb: failed! ', err);
  } else {
    console.log('Connect to mongodb: successful');
  }
});

var app = express();

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(cookieParser());

// add CORS to the api 
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.use(baseUrl + '/todos', todos);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  res.json({
    status: 404,
    message: 'Resource not found!'
  });
});

// error handlers
// development error handler and this will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.json({
      message: err.message,
      error: err
    });
  });
}

// production error handler and this will not leake stacktraces to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.json({
    message: err.message
  });
});

module.exports = app;