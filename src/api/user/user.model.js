const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      require: true,
    },
    surname: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      require: true,
      unique: true,
    },
    phone: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    confirmPassword: {
      type: String,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    profilePicture: String,
  },
  {
    timestamps: true, // This option adds `createdAt` and `updatedAt` fields
  }
);

module.exports = mongoose.model("User", UserSchema);
