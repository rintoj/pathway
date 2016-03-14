var User = require('../models/User');
var Base64 = require('../util/Base64');
var GenericService = require('./GenericService');

(function UserService() {

  // create generic service for User
  var service = new GenericService(User, {

    // preprocess each request
    preprocess: function(request, response) {
      if (request.query.password) {
        request.query.password = Base64.encode(request.query.password);
      }
      if (request.body.password) {
        request.body.password = Base64.encode(request.body.password);
      }
    },

    // post process each response
    postprocess: function(requeset, response, error, item) {
      if (item && item.password) {
        item.password = undefined;
        delete item.password;
      }
      if (item instanceof Array) {
        for (i of item) {
          i.password = undefined;
          delete i.password;
        }
      }
    }
  });

  // bind all the routes
  service.bind();

  module.exports = service;

})();