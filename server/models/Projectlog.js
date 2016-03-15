var mongoose = require('mongoose');

var ProjectlogSchema = new mongoose.Schema({
  index: {
    type: Number,
    index: {
      unique: true,
      required: true,
      default: 0
    }
  },
  title: {
    type: String,
    index: {
      required: true
    }
  },
  description: String,
  status: {
    type: String,
    required: true,
    default: 'new'
  },
  createdDate: {
    type: Date,
    required: true,
    default: Date.now
  }
});

module.exports = mongoose.model('Projectlog', ProjectlogSchema);