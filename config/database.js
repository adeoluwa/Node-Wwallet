const mongoose = require('mongoose');

const { MONGO_URI } = process.env;

/* Exporting the mongoose connection to the database. */
 module.exports = () => {
 
  return  mongoose 
    .connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
   
};
