require('dotenv').config();

// require('./config/database').connect();

const express = require('express');

const bcrypt = require('bcryptjs');

const jwt = require('jsonwebtoken');

const app = express();

const axios = require('axios');

const User = require('./model/user');

const path = require('path');

const Wallet = require('./model/wallet');

/* Importing the WalletTransaction model. */
const WalletTransaction = require('./model/wallet_transaction');

const Transaction = require('./model/transaction');

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
      password: encryptedPassword,
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
    user.token = token;

    /* Sending the user object to the client. */
    // return new user
    res.status(201).json(user);
  } catch (error) {
    console.log(error);
  }
});

// login Route
app.post('/login', async (req, res) => {
  try {
    /* Destructuring the email and password from the request body. */
    const { email, password } = req.body;

    /* Checking if the user has provided all the required input. */
    if (!(email && password)) {
      res.status(400).send('All input is required');
    }

    /* Checking if the user already exist in the database. */
    const user = await User.findOne({ email });

    /* Checking if the user exist and if the password is correct. If the password is correct, it will
   create a token for the user and assign it to the user. If the password is incorrect, it will send
   an error message to the client. */
    if (user && (await bcrypt.compare(password, user.password))) {
      const token = jwt.sign(
        { user_id: user._id, email },
        process.env.TOKEN_KEY,
        {
          expiresIn: '2h',
        }
      );

      user.token = token;

      res.status(400).send('Invalid Credentials');
    }
  } catch (error) {
    console.log(error);
  }
});

app.get('/pay', (req, res) => {
  res.sendFile(path.join(__dirname + '/index.html'));
});

app.get('/response', async (req, res) => {
  /* Destructuring the transaction_id from the request query. */
  const { transaction_id } = req.query;

  /* Creating a url to make a request to the flutterwave api to verify the transaction. */
  const url = `https://api.flutterwave.com/v3/transactions/${transaction_id}/verify`;

  /* Making a request to the flutterwave api to verify the transaction. */
  const response = await axios({
    url,
    method: 'get',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `${process.env.FLUTTERWAVE_V3_SECRET_KEY}`,
    },
  });

  console.log(response.data.data);

  /* Destructuring the response.data.data object. */
  const { status, currency, id, amount, customer } = response.data.data;


  const transcationExist = await Transaction.findOne({ transactionId: id})

  if (transcationExist){
    return res.status(409).send("Transaction Already Exist")
  }

  /* Finding a user by email. */
  const user = await User.findOne({ email: customer.email });

  console.log(user);

  /* Checking if the user exist in the database. If the user does not exist, it will return a response
  to the client. */
  if (!user) {
    return res.status(400).json({
      message: 'user does not exist',
      data: null,
    });
  }

  /* Calling the validateUserWallet function and passing the user._id as an argument. */
  const wallet = await validateUserWallet(user._id);

  /* Creating a wallet transaction for a user. */
  await createWalletTransaction(user._id, status, currency, amount);

  /* Creating a transaction. */
  await createTransaction(user._id, id, status, currency, amount, customer);

  /* Updating the wallet of the user. */
  await updateWallet(user._id, amount);

  /* Returning a response to the client. */
  return res.status(200).json({
    response: 'wallet funded successfully',
    data: wallet,
  });
});

app.get('/wallet/:userId/balance', async (req, res) => {
  try {
    const { userId } = req.params;

    const wallet = await Wallet.findOne({ userId });

    res.status(200).json(wallet.balance);
  } catch (error) {
    console.log(error);
  }
});

// Validating User Wallet
/**
 * It checks if a user has a wallet, if not, it creates one for them.
 * @param userId - The userId of the user who is making the payment
 * @returns The userWallet or the wallet.
 */
const validateUserWallet = async (userId) => {
  try {
    const userWallet = await Wallet.findOne({ userId });

    if (!userWallet) {
      const wallet = await Wallet.create({
        userId,
      });

      return wallet;
    }

    return userWallet;
  } catch (error) {
    console.log(error);
  }
};

// Create wallet Transaction
/**
 * It creates a wallet transaction for a user.
 * @param userId - The userId of the user who is making the transaction
 * @param status - 'pending'
 * @param currency - The currency of the transaction.
 * @param amount - The amount of money to be added to the wallet
 * @returns The walletTransaction object
 */
const createWalletTransaction = async (userId, status, currency, amount) => {
  try {
    const walletTransaction = await WalletTransaction.create({
      amount,
      userId,
      isInflow: true,
      currency,
      status,
    });
    return walletTransaction;
  } catch (error) {
    console.log(error);
  }
};

// Create Transaction
/**
 * It creates a transaction
 * @param userId - The id of the user who made the payment.
 * @param id - The transaction ID.
 * @param status - The status of the transaction.
 * @param currency - The currency of the transaction.
 * @param amount - The amount to be charged.
 * @param customer - {
 */
const createTransaction = async (
  userId,
  id,
  status,
  currency,
  amount,
  customer
) => {
  try {
    // create transaction

    const transaction = await Transaction.create({
      userId,
      transactionId: id,
      name: customer.name,
      email: customer.email,
      phone: customer.phone_number,
      amount,
      currency,
      paymentStatus: status,
      paymentGateway: 'flutterwave',
    });
    return transaction;
  } catch (
    /* A variable that is used to store the error message. */
    error
  ) {
    console.log(error);
  }
};

//update wallet
/**
 * It finds a wallet by userId, increments the balance by the amount, and returns the updated wallet.
 * @param userId - The userId of the user whose wallet you want to update.
 * @param amount - the amount to be added to the wallet
 * @returns The wallet object.
 */
const updateWallet = async (userId, amount) => {
  try {
    const wallet = await Wallet.findOneAndUpdate(
      { userId },
      { $inc: { balance: amount } },
      { new: true }
    );
    return wallet;
  } catch (error) {
    console.log(error);
  }
};

module.exports = app;
