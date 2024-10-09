const Bookings = require("../api/booking/booking.model");

const getGstRate = (totalPrice) => {
  if (totalPrice <= 1000) {
    return 0; // No GST for room price up to ₹1,000
  } else if (totalPrice <= 2500) {
    return 12; // 12% GST for room price between ₹1,000 and ₹2,500
  } else if (totalPrice <= 7500) {
    return 18; // 18% GST for room price between ₹2,500 and ₹7,500
  } else {
    return 28; // 28% GST for room price above ₹7,500
  }
};

module.exports = { getGstRate };
