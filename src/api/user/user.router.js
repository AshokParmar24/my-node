const express = require("express");
const validate = require("../../middlewares/validate");
const useValidation = require("../../validation/user/userSingUp");
const useSingInValidation = require("../../validation/user/userSingIn");
const auth = require("../../middlewares/auth");

const router = express.Router();
const {
  newUser,
  singIn,
  getAllUser,
  getUserDetails,
  deleteUser,
  updateUser,
  getUsersWithCompanies,
  getUserProfile,
  userReviewHotel
} = require("../../api/user/user.controller");
const multer = require("multer");

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router
  .route("/signup")
  .post(upload.single("profilePicture"), validate(useValidation), newUser);
router.route("/singin").post(validate(useSingInValidation), singIn);
router.route("/all").get(auth, getAllUser);
router.route("/with-companies").get(auth, getUsersWithCompanies); // New route to get users with companies
router.route("/profile").get(auth, getUserProfile);
router.route("/hotel-room-review").get(auth, userReviewHotel);
router.route("/:id").get(auth, getUserDetails);
router.route("/:id").put(auth, updateUser);
router.route("/delete/:id").delete(auth, deleteUser);

module.exports = router;
