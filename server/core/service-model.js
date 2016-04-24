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
var mongoose = require('mongoose');
// var Counter = require('../models/Counter');
var ServiceEndpoint = require('./generic-service');
var errorHandlerRegistered = false;

/**
 * Service model creates a service that can serve a collection from mongo db
 * 
 * @param context The context of the service
 */
var ServiceModel = function ServiceModel(context) {

  if (!context.name || context.name === '') {
    throw '"name" is mandatory!';
  }
  if (!context.schema || context.schema === '') {
    throw '"schema" is mandatory!';
  }

  // create model
  context.model = mongoose.model(context.name, new mongoose.Schema(context.schema));

  // create generic service for the given schema and model
  context.service = new ServiceEndpoint(context.model);

  // if setup required do so here
  if (typeof context.configure === 'function') {
    console.log('setup done!');
  }
  // bind all the routes
  context.service.bind();

  this.errorHandler = function(error, req, res, next) {
    console.log(error);

    if (error && error.errors) {
      _.keys(error.errors).map(function(key) {
        error.errors[key] = error.errors[key].message.replace('`', '\'')
      });

      res.status(error.status || 422);
      return res.json({
        message: error.message,
        error: error.errors
      });
    }

    res.status(error.status || 500);
    res.json({
      message: error.message,
      error: error
    });
  };

  this.register = function register(app, baseUrl) {
    app.use(baseUrl + context.url, context.service.router);
    if (!errorHandlerRegistered) {
      app.use(this.errorHandler);
      errorHandlerRegistered = true;
    }
  }
};

/**
 * Given name and options this creates a context - readonly property
 * 
 * @param name Name of the service
 * @param options Other options
 * @returns A context object.
 */
ServiceModel.createContext = function(name, options) {

  var context = {};
  var fields = Object.keys(options || {});

  // create readonly context
  fields.forEach(function(name) {
    Object.defineProperty(context, name, {
      get: function() {
        return options[name] && (typeof options[name] === 'function' ? options[name].call(context) : options[name]);
      }
    });
  });

  // set name to the context
  Object.defineProperty(context, "name", {
    get: function() {
      return name;
    }
  });

  return context;
}

/**
 * Creates a service
 * 
 * @param name Name of the service (mandatory)
 * @param options Options as object in the format:
 * {
 *    schema: Object, // mandatory
 *    idField: String,
 *    permissions: Object,
 *    configure: Function,
 *    url: String,
 *    userSpace: Boolean
 * }
 * 
 * All of these can be a value with the specified type or a function that return the same type.
 * 
 * @returns (description)
 */
ServiceModel.create = function create(name, options) {
  return new ServiceModel(ServiceModel.createContext(name, options));
}

module.exports = ServiceModel;