/**
 * @author rintoj (Rinto Jose)
 * @license The MIT License (MIT)
 *
 * Copyright (c) 2016 rintoj
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the " Software "), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED " AS IS ", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
var _ = require('lodash');
var express = require('express');
var mongoose = require('mongoose');

module.exports = function ServiceEndpoint(config) {
  if (!config) {
    throw 'Missing configuration attribute "config"';
  }

  this.router = express.Router();

  var autoinc;
  var apifiable;
  var fields = [];
  var required = [];

  // get list of fields
  fields = Object.keys(config.schema);
  
  // get list of required properties
  required = fields.filter(function(name) {
    var property = config.schema[name];
    return property && property.index && property.index.required === true && property.index.default == null;
  });

  // get list of apifiable properties
  apifiable = fields.filter(function(name) {
    var property = config.schema[name];
    return !property || !property.roles || property.roles.indexOf('hidden') < 0;
  });

  // process auto increment fields
  autoinc = fields.filter(function(name) {
    var property = config.schema[name];
    var auto = property.roles && property.roles.indexOf('auto') >= 0;
    if (auto && (property.type === 'String' || property.type === 'Date' || property.type === 'Boolean')) {
      throw 'ERROR: Non-numeric field "' + config.name + '.' + name + '" is configured for "auto" role!';
    }
  });

  // process id field
  var ids = fields.filter(function(name) {
    var property = config.schema[name];
    return property.roles && property.roles.indexOf('id') >= 0;
  });
  if (ids.length > 1) {
    throw 'ERROR: Found duplicate id fields ' + ids.join(', ') + ' for ' + config.name;
  }

  // create schema
  this.schema = new mongoose.Schema(config.schema, {
    toObject: {
      virtuals: true
    },
    toJSON: {
      virtuals: true
    }
  });

  // create virual field
  if (ids.length > 0) {
    debugger;
    this.schema.virtual(ids[0]).get(function() {
      return this._id;
    });
  }

  // create model
  this.model = mongoose.model(config.name, this.schema);

  var send = function send(response, item, status, id) {
    var item = apifiable ? _.pick(item, apifiable) : item;
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

  var validateInvalid = function validateInvalid(item) {
    return _.difference(Object.keys(item), fields);
  }

  var validateRequired = function validateRequired(item) {
    return required.filter(function(field) {
      return item[field] === undefined || item[field] === null;
    });
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

    // preprocess if preprocessor exists
    preprocess("create", request, response);

    // validateRequired for missing fields
    var missingFields = validateRequired(request.body);
    if (missingFields.length > 0) {
      return respond(response, 400, {
        status: "validation_failed",
        message: "Missing attribute(s): " + missingFields.join(', ')
      });
    }

    // validate for invalid fields
    var invalidFields = validateInvalid(request.body);
    if (invalidFields.length > 0) {
      return respond(response, 400, {
        status: "validation_failed",
        message: "Invalid attribute(s): " + invalidFields.join(', ')
      });
    }

    model.create(request.body, function(error, item) {

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

    model.find(request.query, function(error, items) {

      // postprocess if postprocessor exists
      postprocess("list", request, response, error, items);

      if (error) return next(error);
      response.json(items);
    });
  }

  this.query = function query(request, response, next) {

    // preprocess if preprocessor exists
    preprocess("query", request, response);

    model.find(request.body, request.query, function(error, items) {

      // postprocess if postprocessor exists
      postprocess("query", request, response, error, items);

      if (error) return next(error);
      response.json(items);
    });
  };

  this.deleteAll = function deleteAll(request, response, next) {

    // preprocess if preprocessor exists
    preprocess("deleteAll", request, response);

    model.remove(request.query, function(error, item) {

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

    model.findById(request.params.id, function(error, item) {

      // postprocess if postprocessor exists
      postprocess("getById", request, response, error, item);

      if (error) return next(error);
      send(response, item, undefined, request.params.id);
    });
  }

  this.updateById = function updateById(request, response, next) {

    // preprocess if preprocessor exists
    preprocess("updateById", request, response);

    // validate for invalid fields
    var invalidFields = validateInvalid(request.body);
    if (invalidFields.length > 0) {
      return respond(response, 400, {
        status: "validation_failed",
        message: "Invalid attribute(s): " + invalidFields.join(', ')
      });
    }

    model.findByIdAndUpdate(request.params.id, request.body, function(error, item) {

      // postprocess if postprocessor exists
      postprocess("updateById", request, response, error, item);

      if (error) return next(error);
      send(response, item, "updated", request.params.id);
    });
  };

  this.deleteById = function deleteById(request, response, next) {

    // preprocess if preprocessor exists
    preprocess("deleteById", request, response);

    model.findByIdAndRemove(request.params.id, request.body, function(error, item) {

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

    // enable method chaining
    return this;
  }

  this.send = send;
  this.respond = respond;
  this.preprocess = preprocess;
  this.postprocess = postprocess;

}