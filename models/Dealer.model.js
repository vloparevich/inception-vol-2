const { Schema, model } = require('mongoose');

// TODO: Please make sure you edit the user model to whatever makes sense in this case
const dealerSchema = new Schema({
  dealerName: {
    type: String,
  },
  delaerUrl: {
    type: String,
  },
  // vehicle: [{ type: Schema.Types.ObjectId, ref: 'Vehicle' }],
  review: [{ type: Schema.Types.ObjectId, ref: 'Review' }],
});

const Dealer = model('Dealer', dealerSchema);

module.exports = Dealer;
