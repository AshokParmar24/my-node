const express = require("express");
const { validationResult } = require("express-validator");

// can be reused by many routes
const validate = (validations) => {
  return async (req, res, next) => {
    try {
      // Sequential processing, stops running validations chain if one fails.
      for (const validation of validations) {
        // Run validation and get the result
        const result = await validation?.run(req);
        // Ensure result is defined and has isEmpty method
        if (result && !validationResult(req).isEmpty()) {
          return res.status(400).json({ errors: validationResult(req).array() });
        }
      }

      // Proceed to next middleware if no validation errors
      next();
    } catch (error) {
      // Handle any errors that occur during validation
      console.error('Validation error:', error);
      res.status(500).json({ message: 'Internal server error.' });
    }
  };
};

module.exports = validate;
