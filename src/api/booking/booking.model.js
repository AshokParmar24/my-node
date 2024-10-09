const mongoose = require("mongoose");

const bookingSchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      require: true,
      ref: "User",
    },
    roomId: {
      type: mongoose.Schema.Types.ObjectId,
      require: true,
      ref: "User",
    },
    checkIn: {
      type: Date,
      required: true,
    },
    checkOut: {
      type: Date,
      required: true,
    },
    bookingStatus: {
      type: String,
      enum: ["booked", "checked_in", "checked_out", "cancelled"],
      default: "booked",
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "pending",
    },
    discountCoupon: {
      type: String,
      default: null,
    },
    discountPrice: {
      type: Number,
      default: 0,
    },
    gstRate: {
      type: Number,
      default: 0, // Add a default value for GST percentage
    },
    gstAmount: {
      type: Number,
      default: 0, // Add a default value for GST percentage
    },
    totalPrice: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const booking = mongoose.model("Booking", bookingSchema);

module.exports = booking;
