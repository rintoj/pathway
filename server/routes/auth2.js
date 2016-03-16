var uuid = require('uuid');
var User = require('../models/User');
var Base64 = require('../util/Base64');
var Client = require('../models/Client');
var express = require('express');
var AccessToken = require('../models/AccessToken');
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

        getAccessToken: function getAccessToken(bearerToken, callback) {
          AccessToken.findOne({
            token: bearerToken,
            type: 'access'
          }, callback);
        },

        getClient: function(clientId, clientSecret, callback) {
          Client.findById(clientId, {
            clientSecret: clientSecret,
            active: true
          }, function(error, item) {
            if (error) return callback(error);
            if (!item) return callback(new Error('Client not found!'));
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
            if (!item) return callback(new Error('Client not found!'));
            callback(null, true);
          });
        },

        getUser: function getUser(userid, password, callback) {
          User.findOne({
            userid: userid,
            password: Base64.encode(password),
            active: true
          }, function(error, item) {
            if (error) return callback(error);
            if (!item) return callback(new Error('User not found!'));

            callback(null, {
              userid: item.userid,
              name: item.name,
              roles: item.roles
            });
          });
        },

        saveAccessToken: function saveAccessToken(accessToken, clientId, expires, user, callback) {
          this.saveToken(accessToken, clientId, expires, user, 'access', callback);
        },

        saveRefreshToken: function saveRefreshToken(refreshToken, clientId, expires, user, callback) {
          this.saveToken(refreshToken, clientId, expires, user, 'refresh', callback);
        },

        saveToken: function saveToken(token, clientId, expires, user, type, callback) {
          AccessToken.remove({
            userid: user.userid,
            clientId: clientId,
            type: type
          }, function(error, item) {
            if (error) return callback(error);
            AccessToken.create({
              token: token,
              clientId: clientId,
              expires: expires,
              userid: user.userid,
              type: type
            }, callback);
          });
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

        if (error && error.error_description === "The access token was not found") {
          res.status(401);
          return res.json({
            code: 401,
            error: "Unauthorized!"
          });
        }

        if (error) {
          res.status(400);
          return res.json({
            code: 400,
            error: error.error_description || error.message
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
      //   app.use(baseUrl, app.oauth.authorise());

      // add error handler for auth errors
      //   addErrorHandler();

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