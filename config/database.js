const mongoose = require('mongoose');

const { MONGO_URI } = process.env;

/* Exporting the connect function. */
exports.connect = () => {
 /* Connecting to the database. */
  mongoose
    .connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => {
      console.log('Successfully connected to database');
    })
    .catch((error) => {
      console.log('database connection failed. Exiting now ...');
      console.log(error);
      process.exit(1);
    });
};
