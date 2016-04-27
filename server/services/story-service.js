var ServiceModel = require('../core/service-model');
module.exports = ServiceModel.create("Story", {

  url: '/story',

  idField: "id",
  userSpecific: {field: "_user" },
  timestamps: true,

  schema: {
    index: {
      type: Number,
      required: true,
      min: 1,
      autoIncrement: true
    },
    sampleIndex: {
      type: Number,
      required: true,
      autoIncrement: true
    },
    title: {
      type: String,
      required: true
    },
    description: String,
    status: {
      type: String,
      required: true,
      default: 'new',
      enum: ['new', 'progress', 'done', 'hold']
    },
    createdDate: {
      type: Date,
      required: true,
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