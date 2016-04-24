var ServiceModel = require('./service-model');
module.exports = ServiceModel.create("Person", {

  url: '/person',

  idField: "name",
  userSpace: true,

  schema: {
    name: {
      type: String,
      default: 'hahaha'
    },
    age: {
      type: Number,
      min: 18,
      index: true
    },
    bio: {
      type: String,
      match: /[a-z]/
    },
    date: {
      type: Date,
      default: Date.now
    }
  },

  permissions: function() {
    return {
      item: {
        read: ['None'],
        write: ['None'],
        delete: ['None']
      },
      bulk: {
        read: ['None'],
        write: ['None'],
        delete: ['None']
      }
    };
  },

  configure: function() {
    console.log('configure');
    // this.model.path('name').set(function(v) {
    //   return capitalize(v);
    // });
  }
});