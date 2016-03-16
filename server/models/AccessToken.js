var mongoose = require('mongoose');

var AccessTokenSchema = new mongoose.Schema({
  token: {
    type: String,
    required: true,
    index: {
      unique: true
    }
  },
  clientId: {
    type: String,
    required: true
  },
  expires: {
    type: Date,
    required: true,
    default: Date.now
  },
  userid: {
    type: String,
    required: true
  },
  type: String
});

module.exports = mongoose.model('AccessToken', AccessTokenSchema);