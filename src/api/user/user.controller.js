const User = require("./user.model");
const { createUser } = require("../../operator/user/createUser");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
const { uploadFile, generateS3Url } = require("../../helper/multur");
const { v4: uuid } = require("uuid");

const newUser = async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res
        .status(400)
        .json({ status: false, message: "No profilePicture uploaded" });
    }
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const fileName = uuid() + file.originalname;
    const uploadResponse = await uploadFile(
      process.env.BUCKET_NAME,
      fileName,
      req.file.buffer
    );
    console.log("uploadResponse", uploadResponse);

    // Prepare user data
    const userData = {
      ...req.body,
      password: hashedPassword,
      confirmPassword: hashedPassword,
      profilePicture: fileName,
    };

    req.body.password = hashedPassword;
    req.body.confirmPassword = hashedPassword;

    const newUser = await createUser(userData);
    const userObject = newUser.toObject();
    delete userObject.password;
    delete userObject.confirmPassword;

    if (newUser) {
      const sendRegistrationEmail = async () => {
        // Create a transporter object using the default SMTP transport
        let transporter = nodemailer.createTransport({
          host: "smtp.gmail.com", // Replace with your SMTP server host
          port: "gmail", // Repl    ace with your SMTP server port
          secure: false, // true for 465, false for other ports
          auth: {
            user: process.env.TEST_EMAIL, // Replace with your email
            pass: process.env.EMAIL_TEST_PASSWORD, // Replace with your email password
          },
        });

        // Send mail with defined transport object
        let info = await transporter.sendMail({
          from: process.env.TEST_EMAIL, // Sender address
          to: newUser?.email, // List of receivers
          subject: "Registration Confirmation", // Subject line
          text: `Hello ${newUser?.name},\n\nThank you for registering!`, // Plain text body
          html: `<b>Hello ${newUser?.surname}</b><br>Thank you for registering!`, // HTML body
        });

        console.log("Message sent: %s", info.messageId);
      };
      sendRegistrationEmail();
    }
    return res.status(200).json({
      data: userObject,
      status: true,
      message: "user create successful",
    });
  } catch (error) {
    throw error;
  }
};

const singIn = async (req, res) => {
  try {
    const existUser = await User.findOne({
      email: req?.body?.email,
      isActive: true,
    });

    if (!existUser) {
      return res
        .status(400)
        .json({ message: "User not  exists", status: false });
    }
    const matchPassword = await bcrypt.compare(
      req?.body?.password,
      existUser?.password
    );
    if (!matchPassword) {
      return res
        .status(401)
        .json({ message: "Invalid email or password", status: false });
    }

    const token = jwt.sign(
      {
        email: existUser?.email,
        password: existUser?.password,
        id: existUser?.id,
      },
      process?.env?.JWT_SECRET,
      { expiresIn: "24h" }
    );
    res.status(200).json({
      message: "Login successful",
      status: true,
      user: {
        id: existUser.id,
        name: existUser.name,
        email: existUser.email,
        phone: existUser.phone,
        surname: existUser.surname,
        token,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", status: false });
  }
};

const getAllUser = async (req, res) => {
  try {
    // Query the database for all users, excluding sensitive fields
    // const users = await User.find(
    //   { isActive: true },
    //   { password: 0, confirmPassword: 0, isActive: 0 }
    // );

    console.log("req.bodyreq.bodyreq.body :>> ", req.body);

    const pageSize = req?.body?.limit || 10; // Default pageSize to 10 if not provided
    const currentPage = req.body.page - 1;
    const skip = req.body.limit * currentPage || 0;
    const searchQuery = req.body.search || "";
    console.log("pageSize :>> ", pageSize, skip);
    const users = await User.aggregate([
      {
        $match: {
          isActive: true,
          email: { $regex: `^${searchQuery}`, $options: "i" }, // Match emails starting with `searchQuery`
        },
      },
      {
        $project: {
          password: 0,
          confirmPassword: 0,
        },
      },
      {
        $facet: {
          // Fetch paginated results
          users: [
            { $skip: skip }, // Skip the first `skip` records
            { $limit: pageSize }, // Limit the result to `pageSize` records
          ],
          // Get the total count of documents matching the query
          totalCount: [{ $count: "count" }],
        },
      },
      {
        $unwind: "$totalCount",
      },
      {
        $project: {
          users: 1, // Keep the users array
          totalCount: "$totalCount.count", // Extract the count from the array
        },
      },
    ]);
    console.log("usersusers :>> ", users);

    // Check if users were found
    if (users.length === 0) {
      return res.status(404).json({
        status: true,
        message: "No users found",
      });
    }

    users[0].users = await Promise.all(
      users[0].users.map(async (user) => {
        if (user.profilePicture) {
          user.profilePicture = await generateS3Url(
            process.env.BUCKET_NAME,
            user.profilePicture
          );
        }
        return user;
      })
    );

    // Return the list of users with a 200 OK status and status true
    res.status(200).json({
      status: true,
      data: users.length ? users[0] : [], // 'result' is an array with one object, so we extract the first element
      message: "Users retrieved successfully ",
    });
  } catch (error) {
    // Log the error for debugging
    console.error("Error retrieving users:", error);

    // Return a 500 Internal Server Error status with status false and a message
    res.status(500).json({
      status: false,
      message: "An error occurred while retrieving users",
    });
  }
};

const getUserDetails = async (req, res) => {
  try {
    // Validate that req.params.id is present
    if (!req.params.id) {
      return res
        .status(400)
        .json({ status: false, message: "User ID is required" });
    }

    // Find user by ID
    const userDetails = await User.findById(
      req.params.id,
      "-password -confirmPassword -isActive"
    );

    // Check if user was found
    if (!userDetails) {
      return res.status(404).json({ status: false, message: "User not found" });
    }

    // Return user details
    res.status(200).json({ status: true, error: false, userDetails });
  } catch (error) {
    // Log the error and send a server error response
    console.error("Error fetching user details:", error);
    res.status(500).json({ status: false, message: "Internal Server Error" });
  }
};

const deleteUser = async (req, res) => {
  try {
    // Validate that req.params.id is present
    if (!req.params.id) {
      return res
        .status(400)
        .json({ status: false, message: "User ID is required" });
    }

    const existUser = await User.findOne({
      _id: req.params.id,
      isActive: true,
    });

    if (!existUser) {
      return res.status(404).json({ status: false, message: "User not found" });
    }

    // Find user by ID and delete
    const userDetails = await User.findByIdAndUpdate(
      existUser.id,
      { isActive: false },
      { new: true }
    );

    // Return success response
    res.status(200).json({
      status: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    // Log the error and send a server error response
    console.error("Error deleting user:", error);
    res.status(500).json({ status: false, message: "Internal Server Error" });
  }
};

const updateUser = async (req, res) => {
  try {
    console.log("object :>> ", req.params.id);
    if (!req.params.id) {
      return res
        .status(400)
        .json({ status: false, message: "User ID is required" });
    }
    const updatedUser = await User.findByIdAndUpdate(req.params.id, req.bod, {
      new: true,
    }).select("-password -confirmPassword -isActive");

    if (!updatedUser) {
      return res.status(404).json({
        status: false,
        message: "User not found",
      });
    }
    res.status(200).json({
      status: true,
      data: updatedUser,
      message: "User successfully update",
    });
  } catch (error) {
    res.status(500).json({ status: false, message: "Internal Server Error" });
  }
};

const getUsersWithCompanies = async (req, res) => {
  try {
    const userWidthCompany = await User.aggregate([
      {
        $match: { isActive: true }, // Match active users
      },
      {
        $lookup: {
          from: "companys", // Collection name in MongoDB
          localField: "_id", // Field in the User collection
          foreignField: "userId", // Field in the Company collection
          as: "companys", // Output array field
        },
      },
    ]);

    res.status(200).json({
      status: true,
      data: userWidthCompany,
      message: "User successfully update",
    });
  } catch (error) {
    console.log("error==>", error);

    res.status(500).json({ status: false, message: "Internal Server Error" });
  }
};

const getUserProfile = async (req, res) => {
  try {
    // Assuming req.user contains the user information from the auth middleware
    const userId = req.user._id;

    // Query the database using the user's ObjectId
    const user = await User.findById(userId, {
      password: 0,
      confirmPassword: 0,
    });
    user.profilePicture = await generateS3Url(
      process.env.BUCKET_NAME,
      user.profilePicture
    );
    if (!user) {
      return res.status(404).json({ status: false, message: "User not found" });
    }

    res.status(200).json({ status: true, user });
  } catch (error) {
    console.error("Error fetching user details:", error);
    res.status(500).json({ status: false, message: "Internal Server Error" });
  }
};

const userReviewHotel = async (req, res) => {
  const page = parseInt(req.query.page) || 1; // Current page number, default is 1
  const limit = parseInt(req.query.limit) || 10; // Number of documents per page, default is 10
  const skip = (page - 1) * limit;
  try {
    const userReview = await User.aggregate([
      {
        $match: { isActive: true }, // Filter active users
      },
      {
        $lookup: {
          from: "companys", // Collection to join (companys)
          localField: "_id", // User ID field in User collection
          foreignField: "userId", // Field in companys collection to match
          as: "userHotel", // Output field for joined data
        },
      },
      {
        $unwind: {
          path: "$userHotel", // Unwind the userHotel array
          preserveNullAndEmptyArrays: true, // Optional: include only users with hotels
        },
      },
      {
        $lookup: {
          from: "rooms", // Collection to join (companys)
          localField: "userHotel._id", // User ID field in User collection
          foreignField: "hotel", // Field in companys collection to match
          as: "hotelRooms", // Output field for joined data
        },
      },
      {
        $unwind: {
          path: "$hotelRooms", // Unwind the userHotel array
          preserveNullAndEmptyArrays: true, // Optional: include only users with hotels
        },
      },
      {
        $lookup: {
          from: "hotelreviews", // Collection to join (companys)
          localField: "hotelRooms.hotel", // User ID field in User collection
          foreignField: "hotelId", // Field in companys collection to match
          as: "hotelReview", // Output field for joined data
        },
      },
      {
        $unwind: {
          path: "$hotelReview", // Unwind the userHotel array
          preserveNullAndEmptyArrays: true, // Optional: include only users with hotels
        },
      },
      {
        $lookup: {
          from: "coupons", // Collection to join (companys)
          localField: "hotelRooms.hotel", // User ID field in User collection
          foreignField: "userHotel_id", // Field in companys collection to match
          as: "couponHotel", // Output field for joined data
        },
      },
      {
        $unwind: {
          path: "$couponHotel", // Unwind the userHotel array
          preserveNullAndEmptyArrays: true, // Optional: include only users with hotels
        },
      },
      {
        $lookup: {
          from: "bookings", // Collection to join (companys)
          localField: "roomId", // User ID field in User collection
          foreignField: "hotelRooms._id", // Field in companys collection to match
          as: "bookingRoom", // Output field for joined data
        },
      },
      {
        $unwind: {
          path: "$bookingRoom", // Unwind the userHotel array
          preserveNullAndEmptyArrays: true, // Optional: include only users with hotels
        },
      },
      {
        $group: {
          _id: "$_id", // Group by user ID
          userDetails: { $push: "$$ROOT" }, // Push entire document (all fields)
        },
      },
      {
        $skip: skip, // Skip the documents for pagination
      },
      {
        $limit: limit, // Limit the number of documents per page
      },
    ]);

    console.log("userReview :>> ", userReview);
    res.status(200).json({ status: true, userReview });
  } catch (error) {
    console.error("Error fetching user reviews:", error);
    res.status(500).json({ status: false, message: "Internal Server Error" });
  }
};

module.exports = {
  newUser,
  singIn,
  getAllUser,
  getUserDetails,
  deleteUser,
  updateUser,
  getUsersWithCompanies,
  getUserProfile,
  userReviewHotel,
};
