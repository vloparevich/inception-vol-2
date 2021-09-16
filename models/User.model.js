const { Schema, model } = require('mongoose');

// TODO: Please make sure you edit the user model to whatever makes sense in this case
const userSchema = new Schema({
  email: {
    type: String,
    unique: false,
    required: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
  },
  firstName: { type: String, required: true },
  lastName: { type: String },
  location: { type: String },
  currentVehicle: [{ type: Array }],
  vehicles: [{ type: Schema.Types.ObjectId, ref: 'Vehicle' }], // VINs will be saved
  reviews: [{ type: Schema.Types.ObjectId, ref: 'Review' }], // Reviews in regards to the Delaerships
  profilePic: String,
});

const User = model('User', userSchema);

module.exports = User;
