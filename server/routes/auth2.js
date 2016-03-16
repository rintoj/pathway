var uuid = require('uuid');
var User = require('../models/User');
var Base64 = require('../util/Base64');
var Client = require('../models/Client');
var express = require('express');
var Token = require('../models/Token');
var oauthserver = require('oauth2-server');
var GenericService = require('./GenericService');

(function() {

  var OAuthService = function OAuthService(app, baseUrl) {

    var client;
    var model = {};

    baseUrl = baseUrl || '';

    function createClientService() {
      client = new GenericService(Client);
      client.bind();
    }

    function createModel() {
      model = {

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

        getToken: function getAccessToken(token, type, callback) {
          Token.findOne({
            token: token,
            type: type
          }, function(error, item) {
            if (error) return callback(error);
            callback(null, item);
          });
        },

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

        saveAccessToken: function saveAccessToken(accessToken, clientId, expires, user, callback) {
          this.saveToken(accessToken, clientId, expires, user.id, 'access', callback);
        },

        saveRefreshToken: function saveRefreshToken(refreshToken, clientId, expires, user, callback) {
          this.saveToken(refreshToken, clientId, expires, user.id, 'refresh', callback);
        },

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

        revokeRefreshToken: function revokeRefreshToken(token, callback) {
          this.revokeToken(token, 'refresh', callback);
        },

        revokeToken: function revokeToken(token, type, callback) {
          console.log('revoke token: ', type, token);
          Token.remove({
            token: token,
            type: type
          }, callback);
        },

        validateScope: function validateScope(token, scope, callback) {
          console.log(token, scope, callback);
        }

      };
    }

    function createAuth() {
      app.oauth = oauthserver({
        model: model,
        grants: ['password', 'refresh_token'],
        debug: true
      });
    }

    function addErrorHandler() {
      app.use(function(error, req, res, next) {

        if (error && error.error_description === "The access token was is not found") {
          res.status(401);
          return res.json({
            code: 401,
            error: "Unauthorized!"
          });
        }

        if (error) {
          console.log(error);
          res.status(400);
          return res.json({
            code: 400,
            error: error.message
          });
        }
        next();
      });
    }

    function bind() {

      // api to obtain access token
      app.all(baseUrl + '/token', app.oauth.grant());

      // add client creation url
      app.use(baseUrl + '/client', client.router);

      // use authorization
      app.use(app.oauth.authorise());

      // add error handler for auth errors
      addErrorHandler();

      // auth own error handler
      app.use(app.oauth.errorHandler());

    }

    createClientService();
    createModel();
    createAuth();
    bind();

  };

  module.exports = OAuthService;

})();