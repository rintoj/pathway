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

/**
 * Creates service end point with GET, POST, PUT and DELETE methods
 * 
 * @param model Mongoose model to be used by the service
 */
module.exports = function ServiceEndpoint(model) {
  
  if (!model) {
    throw '"model" is mandatory for ServiceEndpoint';
  }

  this.router = express.Router();

  var send = function send(response, item, status, id) {
    // var item = apifiable ? _.pick(item, apifiable) : item;
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

  var validateInvalid = function validateInvalid(item) {
    return _.difference(Object.keys(item), fields);
  }

  var validateRequired = function validateRequired(item) {
    return required.filter(function(field) {
      return item[field] === undefined || item[field] === null;
    });
  }

  this.create = function create(request, response, next) {

    model.create(request.body, function(error, item) {

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
    model.find(request.query, function(error, items) {
      if (error) return next(error);
      response.json(items);
    });
  }

  this.query = function query(request, response, next) {
    model.find(request.body, request.query, function(error, items) {
      if (error) return next(error);
      response.json(items);
    });
  };

  this.deleteAll = function deleteAll(request, response, next) {
    model.remove(request.query, function(error, item) {
      if (error) return next(error);
      send(response, {
        status: "deleted",
        deleted: item
      }, undefined, request.params.id);
    });
  };

  this.getById = function getById(request, response, next) {
    model.findById(request.params.id, function(error, item) {
      if (error) return next(error);
      send(response, item, undefined, request.params.id);
    });
  }

  this.updateById = function updateById(request, response, next) {
    model.findByIdAndUpdate(request.params.id, request.body, {
      runValidators: true
    }, function(error, item) {
      if (error) return next(error);
      send(response, item, "updated", request.params.id);
    });
  };

  this.deleteById = function deleteById(request, response, next) {
    model.findByIdAndRemove(request.params.id, request.body, function(error, item) {
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
}