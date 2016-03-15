var mongoose = require('mongoose');

var AccessTokenSchema = new mongoose.Schema({
  accessToken: {
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
  roles: []
});

module.exports = mongoose.model('AccessToken', AccessTokenSchema);