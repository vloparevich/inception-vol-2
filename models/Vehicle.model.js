const { Schema, model } = require("mongoose");

// TODO: Please make sure you edit the user model to whatever makes sense in this case
const vehicleSchema = new Schema({
  vehicle: {
    make: String,
    model: String,
    year: Number,
    // unique: true -> Ideally, should be unique, but its up to you
  },
});

const Vehicle = model("Vehicle", vehicleSchema);

module.exports = Vehicle;