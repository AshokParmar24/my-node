const mongoose = require("mongoose");

const couponSchema = mongoose.Schema({
  code: {
    type: String,
    require: true,
    unique: true,
  },
  discountPercentage: {
    type: Number,
    required: true,
  },
  validFrom: {
    type: Date,
    required: true,
  },
  validTo: {
    type: Date,
    required: true,
  },
  hotels: [
    {
      // Change from `hotel` to `hotels`
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hotel",
      required: true,
    },
  ],
  userId: {
    // Change from `hotel` to `hotels`
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Coupun = mongoose.model("Coupon", couponSchema);

module.exports = Coupun;
