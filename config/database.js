const mongoose = require('mongoose');

const { MONGO_URI } = process.env;


/* *|CURSOR_MARCADOR|* */
 module.exports = () => {
 /* Connecting to the database. */
  return  mongoose 
    .connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
   
};
