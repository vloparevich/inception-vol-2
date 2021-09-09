const { Schema, model } = require('mongoose');

// TODO: Please make sure you edit the user model to whatever makes sense in this case
const userSchema = new Schema({
  email: {
    type: String,
    unique: true,
    required: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: [true, 'Password is required.'],
  },
  firstName: String,
  lastName: String,
  vehicles: [{ type: Schema.Types.ObjectId, ref: 'Vehicle' }],
});

const User = model('User', userSchema);

module.exports = User;
