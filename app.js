require('dotenv').config();

require('./config/database').connect();

const express = require('express');

const bcrypt = require('bcryptjs');

const jwt = require('jsonwebtoken');

const app = express();

const User = require('./model/user');

/* Telling the server to use the express.json() middleware. */
app.use(express.json());

// Register Route
app.post('/register', async (req, res) => {
  try {
    const { first_name, last_name, email, password } = req.body;

    /* Checking if the user has provided all the required input. */
    if (!(email && password && first_name && last_name)) {
      res.status(400).send('All input is required');
    }

    /* Checking if the user already exist in the database. */
    const oldUser = await User.findOne({ email });

    /* Checking if the user already exist in the database. */
    if (oldUser) {
      return res.status(409).send('User Already Exist. Please Login');
    }

    /* Encrypting the password. */
    encryptedPassword = await bcrypt.hash(password, 10);

    /* Creating a new user in the database. */
    const user = await User.create({
      first_name,
      last_name,
      email: email.toLowerCase(), // sanitize: convert email to lowercase
      password: encryptedPassword(),
    });

   /* Creating a token for the user. */
    const token = jwt.sign(
      { user_id: user._id, email },
      process.env.TOKEN_KEY,
      {
        expiresIn: '2h',
      }
    );

   /* Assigning the token to the user. */
    user.token = token

   /* Sending the user object to the client. */
   // return new user
    res.status(201).json(user)

  } catch (error) {
    console.log(error)
  }
});

// login Route
app.post('/login', (req, res) => {});

module.exports = app;
