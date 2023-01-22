const http = require('http');

const app = require('./app');

const database = require('./config/database');

const server = http.createServer(app);

const { API_PORT } = process.env;

const port = process.env.PORT || API_PORT;

/* Checking if the database is connected. */
database()
  .then(() => {
    console.log('Successfully connected to database');
  })
  .catch((error) => {
    console.log('database connection failed. Exiting now ...');
    console.log(error);
    process.exit(1);
  });


/* Listening to the port and logging the message to the console. */
server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

// server.keepAliveTimeout = 3000
