const { Schema, model } = require("mongoose");

// TODO: Please make sure you edit the user model to whatever makes sense in this case
const vehicleSchema = new Schema({
  vehicle: {
    make: String,
    model: String,
    year: Number,
    displayColor: String,
    mileage: Number,
    bodyType: String,
    condition: String,
    imageUrl: String
  },
  user: { type: Schema.Types.ObjectId, ref: 'User' },
});

const Vehicle = model("Vehicle", vehicleSchema);

module.exports = Vehicle;