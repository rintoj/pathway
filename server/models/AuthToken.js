var mongoose = require('mongoose');

var AuthTokenSchema = new mongoose.Schema({
  user: String,
  roles: [],
  date: {
    type: Date,
    default: new Date(+new Date() + 7*24*60*60*1000)
  }
});

module.exports = mongoose.model('AuthToken', AuthTokenSchema);