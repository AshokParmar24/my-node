const mongoose = require("mongoose");
const moment = require("moment");

const roomSchema = mongoose.Schema(
  {
    roomNumber: { type: String, required: true ,}, // Unique identifier for the room
    type: {
      type: String,
      enum: ["Single", "Double", "Suite"], // Enum for room type
      required: true,
    },
    price: { type: Number, required: true }, // Price per night
    isAvailable: { type: Boolean, default: true }, // Availability status
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    hotel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    }, // Reference to the Hotel (Company)
    // images: [{ type: String }], // Array of image URLs
    description: { type: String }, // Description of the room
    amenities: [{ type: String }], // List of amenities
    maxOccupancy: { type: Number, required: true }, // Maximum number of occupants
    checkInTime: {
      type: String,
      default: moment().set({ hour: 0, minute: 0, second: 0 }).format("h:mm A"), // Default to 12:00 AM
    }, // Check-in time
    checkOutTime: {
      type: String,
      default: moment()
        .set({ hour: 11, minute: 0, second: 0 })
        .format("h:mm A"), // Default to 11:00 AM
    }, // Check-out time
    bedCount: { type: Number, required: true }, // Number of beds in the room
    hasAC: { type: Boolean, default: false }, // Whether the room has air conditioning
    isBooking: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const room = mongoose.model("Room", roomSchema);

module.exports = room;
