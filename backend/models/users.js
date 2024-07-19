const mongoose = require('mongoose');

const collectionName = 'users';
const schemaName = 'User';
const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    _id: { type: Schema.Types.ObjectId, auto: true },
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true },
    dateStarted: { type: Date },
    salary: { type: Number },
    role: {
      type: String,
      enum: ['Manager', 'Worker', 'Driver'],
      required: true
    },
    manager: {
      type: String
    }
  },
  {
    strict: true,
    autoCreate: true,
    timestamps: true
  }
);

const User = mongoose.model(schemaName, userSchema, collectionName);

module.exports = User;
module.exports.schema = userSchema;
