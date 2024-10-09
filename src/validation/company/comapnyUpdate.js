const { body, param } = require("express-validator");
const Companys = require("../../api/company/company.model");
const User = require("../../api/user/user.model");

const companyUpdateValidation = [
  param("id")
    .isMongoId()
    .withMessage("Invalid company ID")
    .bail() // Ensure the next validation is only run if the previous one passes
    .custom(async (value) => {
      const company = await Companys.findById(value);
      if (!company) {
        throw new Error("Company does not exist");
      }
    }),
  body("name")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Company name cannot be empty")
    .isLength({ max: 100 })
    .withMessage("Company name cannot exceed 100 characters"),

  body("email")
    .optional()
    .trim()
    .isEmail()
    .withMessage("Invalid email address")
    .bail()
    .custom(async (value, { req }) => {
      const existingCompany = await Companys.findOne({
        email: value,
        _id: { $ne: req.params.id },
      });
      if (existingCompany) {
        throw new Error("Email already in use by another company");
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
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Street address cannot be empty"),

  body("address.city")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("City cannot be empty"),

  body("address.state")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("State cannot be empty"),

  body("address.postalCode")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Postal code cannot be empty")
    .matches(/^\d{5}(-\d{4})?$/)
    .withMessage("Invalid postal code format"),

  body("address.country")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Country cannot be empty"),

  body("website")
    .optional({ checkFalsy: true })
    .trim()
    .isURL()
    .withMessage("Invalid URL format"),

  body("industry")
    .optional({ checkFalsy: true })
    .trim()
    .isString()
    .withMessage("Industry should be a string")
    .isLength({ max: 50 })
    .withMessage("Industry cannot exceed 50 characters"),

  body("established")
    .optional({ checkFalsy: true })
    .isISO8601()
    .withMessage("Invalid date format for established")
    .bail()
    .custom((value) => {
      const year = new Date(value).getFullYear();
      if (year < 1800 || year > new Date().getFullYear()) {
        throw new Error(
          "Established year must be between 1800 and the current year"
        );
      }
      return true;
    }),

  body("employees")
    .optional({ checkFalsy: true })
    .isInt({ min: 0, max: 100000 })
    .withMessage(
      "Number of employees must be a non-negative integer and not exceed 100,000"
    ),

  body("userId")
    .optional()
    .trim()
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

module.exports = companyUpdateValidation;
