const mongoose = require("mongoose");

const hotelReviewSchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    hotelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hotel",
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1, // Minimum rating
      max: 5, // Maximum rating
    },
    comment: {
      type: String,
      required: false, // Optional field for text review
    },
  },
  {
    timestamps: true,
  }
);

const hotelReivew = mongoose.model("HotelReview", hotelReviewSchema);

module.exports = hotelReivew;
