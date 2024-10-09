const Bookings = require("./booking.model");
const {
  getGstRate,
  updateExpiredBookings,
} = require("../../helper/bookingHelper");
const Rooms = require("../../api/room/room.modal");

const createBooking = async (req, res) => {
  try {
    const { discountPrice, totalPrice } = req.body;
    console.log("discountPrice, :>> ", discountPrice, totalPrice);
    const totalDiscountedPrice = totalPrice - discountPrice;
    console.log("totalDiscountedPrice :>> ", totalDiscountedPrice);
    const gstRate = getGstRate(totalDiscountedPrice);
    console.log("gstRate :>> ", gstRate);
    let gstAmount = 0;
    if (gstRate) {
      gstAmount = (gstRate * totalDiscountedPrice) / 100;
    }

    const total = totalDiscountedPrice + gstAmount;
    console.log("total :>> ", total, gstAmount, totalDiscountedPrice);

    req.body.gstRate = gstRate;
    req.body.gstAmount = gstAmount;
    req.body.totalPrice = total;

    console.log("req.body :>> ", req.body);

    const newBooking = new Bookings(req.body);
    const createdBooking = await newBooking.save();
    if (createdBooking) {
      const upDateRoom = await Rooms.findByIdAndUpdate(
        {
          _id: req?.body?.roomId,
        },
        { isBooking: true, isAvailable: false },
        { new: true }
      );
      res.status(200).json({
        message: "Booking created successfully.",
        data: createdBooking,
        status: true,
      });
    }
  } catch (error) {
    res.status(500).json({
      message: "Internal server error.",
      error: error.message,
      status: false,
    });
  }
};

const userWiseBookings = async (req, res) => {
  try {
    const userWiseBooking = await Bookings.aggregate([
      {
        $group: {
          _id: "$userId", // Group by userId
          bookings: { $push: "$$ROOT" }, // Collect all bookings for the user
        },
      },
      {
        $lookup: {
          from: "users", // Assuming 'users' is the collection where user details are stored
          localField: "_id", // The field from the bookings collection
          foreignField: "_id", // The field from the users collection
          as: "userDetails", // Name of the new field to hold user details
        },
      },
      {
        $unwind: {
          path: "$userDetails", // Unwind the userDetails array to merge with bookings
          preserveNullAndEmptyArrays: true, // Preserve documents with no matching userDetails
        },
      },
      {
        $addFields: {
          'userDetails': {
            $arrayElemAt: [
              {
                $map: {
                  input: ['$userDetails'],
                  as: 'user',
                  in: {
                    _id: '$$user._id',
                    name: '$$user.name',
                    surname: '$$user.surname',
                    email: '$$user.email',
                    phone: '$$user.phone'
                    // Add any other fields you want to include
                  }
                }
              },
              0
            ]
          }
        }
      },
      {
        $project: {
          userDetails: 1, // Include user details in the output
          bookings: 1, // Include bookings in the output
          _id: 0,
        },
      },
    ]);
    console.log("userWiseBooking :>> ", userWiseBooking);
    res.status(200).json({
      status: true,
      data: userWiseBooking,
    });
  } catch (error) {
    res.status(500).json({
      message: "Internal server error.",
      error: error.message,
      status: false,
    });
  }
};

module.exports = { createBooking, userWiseBookings };
