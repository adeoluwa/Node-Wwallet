const { Schema, model } = require('mongoose');

/* Creating a schema for the wallet model. */
const walletSchema = Schema(
  {
    balance: { type: Number, default: 0 },
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'Users',
    },
  },
  { timestamps: true }
);

module.exports = model('wallet', walletSchema);
