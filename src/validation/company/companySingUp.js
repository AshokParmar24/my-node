const { body } = require("express-validator");
const Companys = require("../../api/company/company.model");
const User=require("../../api/user/user.model")

const companySingUpValidation = [
  body("name").trim().notEmpty().withMessage("Company name is required"),

  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .bail()
    .isEmail()
    .withMessage("Invalid email address")
    .bail()
    .custom(async (value) => {
      const existingCompany = await Companys.findOne({ email: value });
      if (existingCompany) {
        throw new Error("Email already in use");
      }
    }),
  body("phone")
    .trim()
    .notEmpty()
    .withMessage("Phone number is required")
    .bail()
    .matches(/^\d{10}$/)
    .withMessage("Phone number must be exactly 10 digits")
    .bail()
    .isMobilePhone("any", { strictMode: false })
    .withMessage("Invalid phone number"),

  body("address.street")
    .trim()
    .notEmpty()
    .withMessage("Street address is required"),

  body("address.city").trim().notEmpty().withMessage("City is required"),

  body("address.state").trim().notEmpty().withMessage("State is required"),

  body("address.postalCode")
    .trim()
    .notEmpty()
    .withMessage("Postal code is required"),

  body("address.country").trim().notEmpty().withMessage("Country is required"),

  body("website")
    .optional({ checkFalsy: true })
    .trim()
    .isURL()
    .withMessage("Invalid URL format"),

  body("industry")
    .optional({ checkFalsy: true })
    .trim()
    .isString()
    .withMessage("Industry should be a string"),

  body("established")
    .optional({ checkFalsy: true })
    .isISO8601()
    .withMessage("Invalid date format for established"),

  body("employees")
    .optional({ checkFalsy: true })
    .isInt({ min: 0 })
    .withMessage("Number of employees must be a non-negative integer"),

  body("userId")
    .trim()
    .notEmpty()
    .withMessage("User ID is required")
    .bail()
    .isMongoId()
    .withMessage("Invalid User ID format")
    .bail()
    .custom(async (value) => {
      const userExists = await User.findById(value);
      if (!userExists) {
        throw new Error("User ID does not exist");
      }
    }),
];

module.exports = companySingUpValidation;
