var Base64 = require('../util/Base64');
var express = require('express');
var AuthToken = require('../models/AuthToken');
var GenericService = require('./GenericService');

(function() {

  // create generic service for User
  var service = new GenericService(AuthToken);

  // bind all the routes
  service.bind();

  service.router.post("/accesstoken", function(request, response) {

  });

  //   var service = new(function Auth2Service() {
  //     this.router = express.Router();

  //     this.router.post("/authenc)
  //   })();

  module.exports = service;

})();