var mongoose = require('mongoose');

var UserSchema = new mongoose.Schema({
  name: String,
  email: {
    type: String,
    index: {
      unique: true
    }
  },
  password: String,
  roles: [],
  date: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('User', UserSchema);