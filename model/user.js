const mongoose = require('mongoose');

/* This is creating a new schema for the user model. */
const userSchema = new mongoose.Schema({
  first_name: { type: String, default: null },
  last_name: { type: String, default: null },
  email: { type: String, unique: true },
  password: { type: String },
});

/* This is exporting the user model to be used in other files. */
module.exports = mongoose.model('user', userSchema);
