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

var tab = '         ';
var rules = [];
var uris = {};

/**
 * Process schema configuration and convert into models
 * # -------- - ------------------ ----------- ----------- ----------- -----------
 * # index    - column             type        required    unique      default
 * # -------- - ------------------ ----------- ----------- ----------- -----------
 *   schema.0 = index              Number      true        true        0
 *   schema.1 = title              String      true        true        null
 * # -------- - ------------------ ----------- ----------- ----------- -----------
 * 
 * @param resources An array in the following format
 * [
 *    "index              Number      true        true        0",
 *    "title              String      true        true        null",
 *    "description        String      false       false       null",
 *    "status             String      true        false       new",
 *    "createdDate        Date        true        false       Date.now"
 * ] 
 *  
 * @returns A schema object
 */
function processSchema(resources) {
  var schemas = {};
  resources.forEach(function(config) {
    var field = config.replace(/(\t|\s)+/g, '|').split('|');
    var schema = {};

    // map type
    schema.type = field[1];
    if (schema.type !== 'String') {
      schema.type = eval(schema.type);
    }

    // map index in the order required, unique and default
    if (field[2] === "true" || field[3] === "true" || field[4] !== "null") {
      schema.index = {};
      if (field[2] === "true") {
        schema.index.required = true;
      }
      if (field[3] === "true") {
        schema.index.unique = true;
      }
      if (field[4] !== "null") {
        schema.index.default = field[4];
        if (schema.type !== 'String') {
          schema.index.default = eval(schema.index.default);
        }
      }
    }

    // add to the master list
    schemas[field[0]] = schema;
  });
  return schemas;
}

/**
 * Collect permissions
 * 
 * @param permit An object
 * @param roles Roles as coma separated string
 * @param methods An array of string with values 'GET', 'POST', 'PUT', 'DELETE', 'OPTIONS' or '*'
 */
function addPermit(permit, roles, methods) {
  if (permit[roles] === undefined) {
    permit[roles] = [];
  }
  permit[roles] = permit[roles].concat(methods);
}

/**
 * Process permission configuration and convert to an array of rules
 * 
 * @param url The url of the resource
 * @param config A string with tab separated values in the following format
 * # ----------- ----------- -----------
 * # read        write       delete 
 * # ----------- ----------- -----------
 *   *           ADMIN       ADMIN
 * 
 * @returns An array of rules
 */
function processPermit(url, config) {

  if (!config) {
    return [];
  }

  var permit = {};
  var permission = config.replace(/(\t|\s)+/g, '|').split('|');
  addPermit(permit, (permission[0].split(',') || ['*']).join(','), ['GET']);
  addPermit(permit, (permission[1].split(',') || ['*']).join(','), ['POST', 'PUT']);
  addPermit(permit, (permission[2].split(',') || ['*']).join(','), ['DELETE']);
  return Object.keys(permit).map(function(role) {
    return ['Bearer', role, permit[role].join(','), url].join(tab);
  });
}

/**
 * Process both item and bulk permission from the configuration
 * 
 * # --------------- - ----------- ----------- -----------
 * # type            - read        write       delete 
 * # --------------- - ----------- ----------- -----------
 *   permission.item = *           ADMIN       ADMIN
 *   permission.bulk = ADMIN       ADMIN       ADMIN
 * # --------------- - ----------- ----------- -----------
 *  
 * @param url The url of the resource
 * @param config Config as an object with properites item and bulk each as string
 *
 * {
 *   "item": "*           ADMIN       ADMIN",
 *   "bulk": "ADMIN       ADMIN       ADMIN"
 * } 
 * 
 * @returns An array of rules
 */
function processPermissions(url, permission) {
  if (!permission) {
    return [];
  }
  return processPermit(url + '/_bulk', permission && permission.bulk)
    .concat(processPermit(url + '/*', permission && permission.item));
}

/**
 * Process a uri configuation
 * 
 * @param url The url of the resource
 * @param config Configuration as an object with two attributes 'schema' and 'permission'
 * {
 *     "schema": [
 *          "index              Number      true        true        0",
 *          "title              String      true        true        null",
 *          "description        String      false       false       null",
 *          "status             String      true        false       new",
 *          "createdDate        Date        true        false       Date.now"
 *       ]
 *     },
 *     "permission": {
 *       "item": "*           ADMIN       ADMIN",
 *       "bulk": "ADMIN       ADMIN       ADMIN"
 *     } 
 *  }
 * 
 * @returns Returns an object with properites 'url': string, 'schema': object, and 'rules': array
 */
function processUri(url, config) {
  return {
    url: url,
    schema: processSchema(config.schema),
    rules: processPermissions(config.permission)
  };
}

module.exports = {

  get rules() {
    return rules;
  },

  /**
   * Configure resources
   * 
   * @param baseUrl Base url as string
   * 
   * @param resourceConfig Overall resource configuration
   * {
   *    "resource": {
   *      "permission": {
   *        "item": "*           ADMIN       ADMIN",
   *        "bulk": "ADMIN       ADMIN       ADMIN"
   *      }
   *    }
   * }
   * 
   * @param uriConfig Individual resources with uri, schema and permission in the following format:
   *  {
   *   "projectlog": {
   *     "schema": [
   *          "index              Number      true        true        0",
   *          "title              String      true        true        null",
   *          "description        String      false       false       null",
   *          "status             String      true        false       new",
   *          "createdDate        Date        true        false       Date.now"
   *       ]
   *     },
   *     "permission": {
   *       "item": "*           ADMIN       ADMIN",
   *       "bulk": "ADMIN       ADMIN       ADMIN"
   *     } 
   *  }
   */
  configure: function(baseUrl, resourceConfig, uriConfig) {
    rules = [
      ['None', '*', 'OPTIONS', baseUrl + '/**/*]]'].join(tab)
    ];

    uris = Object.keys(uriConfig).map(function(url) {
      var config = processUri(baseUrl + '/' + url, uriConfig[url]);
      rules = rules.concat(config.rules);
      return config;
    });

    rules = rules.concat(resourceConfig.permission ? processPermissions(baseUrl + '/**', resourceConfig.permission) : [
      ['Bearer', '*', '*', baseUrl + '/**/*'].join(tab)
    ]);

    console.log(JSON.stringify(uris, null, 4), JSON.stringify(rules, null, 4));
  }
};