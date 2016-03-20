var express = require('express');

module.exports = function ServiceEndpoint(Model, override) {

  if (!Model) {
    throw "'Model' cannot be undefined!";
  }

  override = override || {};
  this.Model = Model;
  this.router = express.Router();

  var send = function send(response, item, status, id) {
    if (item) {
      return response.json(status ? {
        status: status,
        item: item
      } : item);
    }
    return respond(response, 404, {
      status: 404,
      message: 'Invalid resource id ' + id + '!'
    });
  }

  var respond = function respond(response, statusCode, reply) {
    response.status(statusCode);
    response.json(reply);
  }

  var preprocess = function preprocess(type, request, response) {
    if (override.preprocess) {
      override.preprocess(request, response);
    }
    if (override[type] && override[type].preprocess) {
      override[type].preprocess(request, response);
    }
  }

  var postprocess = function postprocess(type, request, response, error, item) {
    if (override.postprocess) {
      override.postprocess(request, response, error, item);
    }
    if (override[type] && override[type].postprocess) {
      override[type].postprocess(request, response, error, item);
    }
  }

  this.create = function create(request, response, next) {
    // request.body.password = request.body.password ? Base64.encode(request.body.password) : undefined;

    // preprocess if preprocessor exists
    preprocess("create", request, response);

    Model.create(request.body, function(error, item) {

      // postprocess if postprocessor exists
      postprocess("create", request, response, error, item);

      // if there is an error 
      if (error) {

        // an error due to duplicate item (index error)
        if (error.code === 11000) {
          return respond(response, 400, {
            status: "failed",
            message: "This is a duplicate item!"
          });
        }

        // unknown error, forward to error handler
        return next(error);
      }

      // created new item
      response.status(201);
      send(response, item, "created");
    });
  };

  this.list = function list(request, response, next) {

    // preprocess if preprocessor exists
    preprocess("list", request, response);

    Model.find(request.query, function(error, items) {

      // postprocess if postprocessor exists
      postprocess("list", request, response, error, items);

      if (error) return next(error);
      response.json(items);
    });
  }

  this.query = function query(request, response, next) {

    // preprocess if preprocessor exists
    preprocess("query", request, response);

    Model.find(request.body, request.query, function(error, items) {

      // postprocess if postprocessor exists
      postprocess("query", request, response, error, items);

      if (error) return next(error);
      response.json(items);
    });
  };

  this.deleteAll = function deleteAll(request, response, next) {

    // preprocess if preprocessor exists
    preprocess("deleteAll", request, response);

    Model.remove(request.query, function(error, item) {

      // postprocess if postprocessor exists
      postprocess("deleteAll", request, response, error, item);

      if (error) return next(error);
      send(response, {
        status: "deleted",
        deleted: item
      }, undefined, request.params.id);
    });
  };

  this.getById = function getById(request, response, next) {

    // preprocess if preprocessor exists
    preprocess("getById", request, response);

    Model.findById(request.params.id, function(error, item) {

      // postprocess if postprocessor exists
      postprocess("getById", request, response, error, item);

      if (error) return next(error);
      send(response, item, undefined, request.params.id);
    });
  }


  this.updateById = function updateById(request, response, next) {

    // preprocess if preprocessor exists
    preprocess("updateById", request, response);

    Model.findByIdAndUpdate(request.params.id, request.body, function(error, item) {

      // postprocess if postprocessor exists
      postprocess("updateById", request, response, error, item);

      if (error) return next(error);
      send(response, item, "updated", request.params.id);
    });
  };

  this.deleteById = function deleteById(request, response, next) {

    // preprocess if preprocessor exists
    preprocess("deleteById", request, response);

    Model.findByIdAndRemove(request.params.id, request.body, function(error, item) {

      // postprocess if postprocessor exists
      postprocess("deleteById", request, response, error, item);

      if (error) return next(error);
      send(response, item, "deleted", request.params.id);
    });
  };

  this.bind = function bind() {

    /* PUT / */
    this.router.put('/', this.create);

    /* GET / */
    this.router.get('/', this.list);

    /* POST / */
    this.router.post('/', this.query);

    /* DELETE / */
    this.router.delete('/', this.deleteAll);

    /* GET /:id */
    this.router.get('/:id', this.getById);

    /* PUT /:id */
    this.router.put('/:id', this.updateById);

    /* DELETE /:id */
    this.router.delete('/:id', this.deleteById);
  }

  this.send = send;
  this.respond = respond;
  this.preprocess = preprocess;
  this.postprocess = postprocess;

}