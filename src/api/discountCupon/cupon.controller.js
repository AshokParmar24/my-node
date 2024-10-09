const Coupon = require("./coupon.model");
const moment = require("moment");
const mongoose = require("mongoose");

const createCouponCode = async (req, res) => {
  try {
    const createCoupon = new Coupon(req.body);

    const createdCoupon = await createCoupon.save();

    if (createdCoupon) {
      res.status(200).json({
        data: createdCoupon,
        status: true,
        message: "coupon create successfully",
      });
    }
  } catch (error) {
    res.status(400).json({ message: error.message, status: false });
  }
};

const hotelUserWiseCoupun = async (req, res) => {
  try {
    const today = moment();

    const hotelUserWiseCoupun = await Coupon.aggregate([
      {
        $match: {
          $expr: {
            $gte: ["$validTo", today],
          },
        },
      },
      {
        $group: {
          _id: "$code",
          couponDetail: { $push: "$$ROOT" },
        },
      },
      {
        $unwind: "$couponDetail", // Unwind couponDetail if it's an array
      },
      {
        $unwind: "$couponDetail.hotels",
      },
      {
        $group: {
          _id: "$couponDetail.hotels",
          couponList: { $push: "$$ROOT" },
          total: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: "companys", // The name of the collection to join with
          localField: "_id", // Field from the Coupon collection
          foreignField: "_id", // Field from the Hotel collection
          as: "hotelDetails",
        },
      },
      {
        $unwind: "$hotelDetails",
      },
      {
        $project: {
          _id: 0,
          hotelName: "$hotelDetails.name",
          couponList: 1,
          total: 1,
          email: "$hotelDetails.email",
          _id: "$hotelDetails._id",
        },
      },
    ]);
    res.status(200).json({
      data: hotelUserWiseCoupun,
      status: true,
      message: "coupon retrive successfully",
    });
  } catch (error) {
    res.status(400).json({ message: error.message, status: false });
  }
};

const getHotelWiseCoupon = async (req, res) => {
  try {
    const id = req.params.id;
    console.log("id :>> ", id);
    const today = moment().toDate();
    console.log("today :>> ", today);
    const couponLisData = await Coupon.aggregate([
      {
        $match: {
          hotels: { $in: [new mongoose.Types.ObjectId(id)] }, // Correct ObjectId usage
          validTo: { $gte: today }, // Ensure `validTo` is greater than or equal to today
        },
      },
      {
        $unwind: "$hotels",
      },

      {
        $match: { hotels: new mongoose.Types.ObjectId(id) },
      },
      {
        $group: {
          _id: null,
          couponList: {
            $push: {
              _id: "$_id",
              code: "$code",
              discountPercentage: "$discountPercentage",
            },
          },
          total: { $sum: 1 },
        },
      },
      {
        $project: { _id: 0 },
      },
    ]);

    const [couponList] = couponLisData;
    res.status(200).json({
      data: couponList,
      status: true,
      message: "coupon retrive successfully",
    });
    console.log("couponList :>> ", couponLisData);
  } catch (error) {
    res.status(400).json({ message: error.message, status: false });
  }
};

module.exports = { createCouponCode, hotelUserWiseCoupun, getHotelWiseCoupon };
