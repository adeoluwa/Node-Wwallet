const mongoose = require('mongoose');

/* Creating a schema for the transaction model. */
const transactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
    },
    transactionId: {
      type: Number,
      trim: true,
    },
    name: {
      type: String,
      required: [true, 'name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'email is required'],
      trim: true,
    },
    phone: {
      type: String,
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
    },
    currency: {
      type: String,
      required: [true, 'currency is required'],
      enum: ['NGN', 'USD', 'EUR', 'GBP'],
    },
    paymentStatus: {
      type: String,
      enum: ['successful', 'pending', 'failed'],
      default: 'pending',
    },
    paymentGateway: {
      type: String,
      required: [true, 'payment gateway is required'],
      enum: ['flutterwave'],
    },
  },
  {
    timestamps: true,
  }
);

/* Exporting the model to be used in other files. */
module.exports = mongoose.model("Transaction", transactionSchema)

