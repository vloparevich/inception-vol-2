const { Schema, model } = require("mongoose");

// TODO: Please make sure you edit the user model to whatever makes sense in this case
const dealerSchema = new Schema({
  dealer: {
    dealerName: String
  },
  user: { type: Schema.Types.ObjectId, ref: 'User' },
});

const Dealer = model("Dealer", dealerSchema);

module.exports = Dealer;