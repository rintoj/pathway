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
 **/

var uuid = require('uuid');
var User = require('../models/User');
var Base64 = require('../util/Base64');
var Client = require('../models/Client');
var express = require('express');
var Token = require('../models/Token');
var oauthserver = require('oauth2-server');
var GenericService = require('./GenericService');

(function() {

  /**
   * OAuthService enables oAuth 2 security to the given path. This implementation is based on 'npm-oauth2-server' module
   * 
   * @param app express.js application refrerence
   * @param baseUrl The base url for the api
   */
  var OAuthService = function OAuthService(app, baseUrl) {

    var client, user;
    var model = {};

    baseUrl = baseUrl || '';

    function defaultSetup() {

      User.remove({
        userId: 'admin'
      }, function(error, item) {
        User.create({
          name: "System Administrator",
          userId: "admin",
          password: Base64.encode("sysadmin@123"),
          active: true,
          roles: [
            "admin"
          ]
        }, function(error, item) {
          if (error) return callback(error);
          console.log('Default user "admin" created!');
        });
      });

      Client.remove({
        name: 'Default'
      }, function(error, item) {
        Client.create({
            _id: "7d65d9b6-5cae-4db7-b19d-56cbdd25eaab",
            clientSecret: "a0c7b741-b18b-47eb-b6df-48a0bd3cde2e",
            name: "Default",
            description: "Default client",
            grantType: ["password", "refresh_token"],
            active: true,
          },
          function(error, item) {
            if (error) return callback(error);
            console.log('Default client "default" created!');
            console.log('Authorization: Basic N2Q2NWQ5YjYtNWNhZS00ZGI3LWIxOWQtNTZjYmRkMjVlYWFiOmEwYzdiNzQxLWIxOGItNDdlYi1iNmRmLTQ4YTBiZDNjZGUyZQ==');
          });
      });
    }

    /**
     * Create a service for managing clients
     */
    function createClientService() {
      client = new GenericService(Client);
      client.bind();
    }

    /**
     * Create a service managing users
     */
    function createUserService() {
      user = new GenericService(User, {

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

      user.bind();
    }

    /**
     * Create the model for performing authentication. The current implementation is using database models 'users', 'clients' and 'tokens'
     */
    function createModel() {
      model = {

        /**
         * Checks if access token is valid entry in 'tokens' collection
         * 
         * @param token The token to be validated
         * @param callback function(error, callback)
         */
        getAccessToken: function getAccessToken(token, callback) {
          this.getToken(token, 'access', function(error, item) {
            if (error) return callback(error);
            if (!item) return callback(new Error('Invalid access token!'));
            var accessToken = {
              accessToken: item.token,
              clientId: item.clientId,
              userId: item.userId,
              expires: item.expires
            };
            callback(null, accessToken);
          });
        },

        /**
         * Checks if refresh token is valid entry in 'tokens' collection, if so return clientId, userId and expires details
         * 
         * @param token The token to be validated
         * @param callback function(error, callback)
         */
        getRefreshToken: function getRefreshToken(token, callback) {
          this.getToken(token, 'refresh', function(error, item) {
            if (error) return callback(error);
            if (!item) return callback(new Error('Invalid refresh token!'));
            var refreshToken = {
              refreshToken: item.token,
              clientId: item.clientId,
              userId: item.userId,
              expires: item.expires
            };
            callback(null, refreshToken);
          });
        },

        /**
         * Generic implementation to fetch 'access' or 'refresh' token from 'tokens' collection
         * 
         * @param token The token to be fetched
         * @param type The type of token, valid values are 'access' and 'refresh'
         * @param callback function(error, callback)
         */
        getToken: function getAccessToken(token, type, callback) {
          Token.findOne({
            token: token,
            type: type
          }, function(error, item) {
            if (error) return callback(error);
            callback(null, item);
          });
        },

        /**
         * Given an id and secret, retrive the client. This implementation mandates clientSecret
         * 
         * @param clientId id of the client
         * @param clientSecret Client's secret
         * @param callback function(error, client)
         */
        getClient: function(clientId, clientSecret, callback) {
          Client.findOne({
            _id: clientId,
            clientSecret: clientSecret,
            active: true
          }, function(error, item) {
            if (error) return callback(error);
            if (!item) return callback(new Error('Invalid client!'));
            callback(null, item);
          });
        },

        /**
         * Check if grant type is allowed for the given client 
         * 
         * @param clientId The id of the client
         * @param grantType Type of grant requested ('password' or 'refres_token')
         * @param callback function(error, valid: boolean);
         */
        grantTypeAllowed: function grantTypeAllowed(clientId, grantType, callback) {
          Client.find({
            _id: clientId,
            active: true,
            grantType: {
              "$in": [grantType]
            }
          }, function(error, item) {
            if (error) return callback(error);
            if (!item) return callback(new Error('Invalid client!'));
            callback(null, true);
          });
        },

        /**
         * Get user given the id and password
         * 
         * @param userId The id of the user to be matched
         * @param password Base64 encoded password
         * @param callback function(error, user: Object)
         */
        getUser: function getUser(userId, password, callback) {
          User.findOne({
            userId: userId,
            password: password,
            active: true
          }, function(error, item) {
            if (error) return callback(error);
            if (!item) return callback(new Error('Invalid user!'));

            callback(null, {
              id: item.userId
            });
          });
        },

        /**
         * Save the access token into 'tokens' collection
         * 
         * @param accessToken The access token to be saved
         * @param clientId client id as string
         * @param expires Expiry date
         * @param user User as object with a mandatory property 'id'
         * @param callback function(error, status)
         */
        saveAccessToken: function saveAccessToken(accessToken, clientId, expires, user, callback) {
          this.saveToken(accessToken, clientId, expires, user.id, 'access', callback);
        },

        /**
         * Save the refresh token into 'tokens' collection
         * 
         * @param refreshToken The refresh token to be saved
         * @param clientId client id as string
         * @param expires Expiry date
         * @param user User object with a mandatory property 'id'
         * @param callback function(error, status)
         */
        saveRefreshToken: function saveRefreshToken(refreshToken, clientId, expires, user, callback) {
          this.saveToken(refreshToken, clientId, expires, user.id, 'refresh', callback);
        },

        /**
         * Generic implementation to save 'access' or 'refresh' token
         * 
         * @param token 'access' or 'refresh' token to be saved
         * @param clientId client id as string
         * @param expires Expiry date as date
         * @param userId The id of the user as string
         * @param type 'access' or 'refresh'
         * @param callback function(error, status)
         */
        saveToken: function saveToken(token, clientId, expires, userId, type, callback) {
          console.log('Save Token => ', 'token: ', token, 'clientId: ', clientId, 'expires: ', expires, 'userId: ', userId, 'type: ', type);
          Token.remove({
            userId: userId,
            clientId: clientId,
            type: type
          }, function(error, item) {
            if (error) return callback(error);
            Token.create({
              token: token,
              clientId: clientId,
              expires: expires,
              userId: userId,
              type: type
            }, callback);
          });
        },

        /**
         * Delete refresh token
         * 
         * @param token The refresh token to be deleted
         * @param callback function(error, status)
         */
        revokeRefreshToken: function revokeRefreshToken(token, callback) {
          this.revokeToken(token, 'refresh', callback);
        },

        /**
         * Generic implementation to delete 'access' or 'refresh' token
         * 
         * @param token 'access' or 'refresh' token to be removed
         * @param type 'access' or 'refresh' as string
         * @param callback function(error, status)
         */
        revokeToken: function revokeToken(token, type, callback) {
          console.log('revoke token: ', type, token);
          Token.remove({
            token: token,
            type: type
          }, callback);
        }

      };
    }

    /**
     * Create oauth server
     */
    function createAuth() {
      app.oauth = oauthserver({
        model: model,
        grants: ['password', 'refresh_token'],
        debug: true
      });
    }

    /**
     * Overrides default error handler
     */
    function addErrorHandler() {
      app.use(function(error, req, res, next) {

        res.status(401);
        if (error && error.error_description === "The access token was is not found") {
          return res.json({
            code: 401,
            error: "Unauthorized!"
          });
        }

        if (error) {
          console.log(error);
          return res.json({
            code: 400,
            error: error.message
          });
        }
        next();
      });
    }

    /**
     * Bind all the necessary api endpoints
     */
    function bind() {

      app.use(baseUrl + '/token', function(request, response, next) {
        if (request.method === 'OPTIONS') {
          response.status(200);
          response.send('POST');
        } else {
          next();
        }
      });

      //   OPTIONS / pathway / api / oauth / token

      // api to obtain access token
      app.use(baseUrl + '/token', app.oauth.grant());

      // use authorization
      app.use(app.oauth.authorise());

      // add client creation url
      app.use(baseUrl + '/client', client.router);

      // add user creation url
      app.use(baseUrl + '/user', user.router);

      // add error handler for auth errors
      addErrorHandler();

      // auth own error handler
      app.use(app.oauth.errorHandler());

    }

    createClientService();
    createUserService();
    createModel();
    createAuth();
    bind();
    defaultSetup();

  };

  module.exports = OAuthService;

})();