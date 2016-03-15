var Counter = require('../models/Counter');
var Projectlog = require('../models/Projectlog');
var GenericService = require('./GenericService');

(function ProjectlogService() {

  // create generic service for Projectlog
  var service = new GenericService(Projectlog);

  var createFun = service.create;

  service.create = function create(request, response, next) {
    Counter.increment('ProjectlogIndex', function(error, value) {
      if (error) return next(error);
      request.body.index = value;
      createFun(request, response, next);
    })
  }

  // bind all the routes
  service.bind();

  module.exports = service;

})();