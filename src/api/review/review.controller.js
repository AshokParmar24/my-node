const HotelReview = require("../review/review.model");

const createHotelReview = async (req, res) => {
  try {
    const review = new HotelReview(req.body);
    const createdReview = await review.save();
    if (createdReview) {
      res.status(200).json({
        data: review,
        status: true,
        message: "review create successfully",
      });
    }
  } catch (error) {
    res.status(400).json({ message: error.message, status: false });
  }
};

const hotelWiseReviewList = async (req, res) => {
  try {
    const hotelWiseReview = await HotelReview.aggregate([
      {
        $group: {
          _id: "$hotelId",
          averageRating: { $avg: "$rating" },
          totalReviews: { $sum: 1 },
          reviews: { $push: "$$ROOT" },
        },
      },
      {
        $lookup: {
          from: "companys", // The name of the collection where hotel details are stored
          localField: "_id",
          foreignField: "_id",
          as: "hotelDetails",
        },
      },
      {
        $unwind: "$hotelDetails", // Unwind the hotel details array to join it with the reviews
      },

      {
        $project: {
          _id: 0,
          hotelId: "$_id",
          hotelName: "$hotelDetails.name",
          averageRating: 1,
          totalReviews: 1,
          reviews: 1,
        },
      },
    ]);
    console.log("hotelWiseReview :>> ", hotelWiseReview);
    res.status(200).json({
      data: hotelWiseReview,
      status: true,
      message: "review create successfully",
    });
  } catch (error) {
    res.status(400).json({ message: error.message, status: false });
  }
};

const useReviewList = async (req, res) => {
  try {
    const useWiseReview = await HotelReview.find().populate("userId");

    const newData = await useWiseReview.reduce((acc, review) => {
      console.log(
        "acc, review acc, reviewacc, reviewacc, review:>> ",
        acc,
        review
      );
      return acc
    });
    console.log('newData :>> ', newData);
     res.status(200).json({
      data: useWiseReview,
      status: true,
      message: "review create successfully",
    });
  } catch (error) {
    res.status(400).json({ message: error.message, status: false });
  }
};

module.exports = { createHotelReview, hotelWiseReviewList, useReviewList };
