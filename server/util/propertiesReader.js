var objectPath = require("object-path");
var PropertiesReader = require('properties-reader');

module.exports = function(propertiesFile) {

  // application properites
  var properties = {};

  // print all the configurations
  var reader = PropertiesReader(propertiesFile)
  reader.each(function(key, value) {
    objectPath.set(properties, key, reader.get(key));
  });

  return properties;
};