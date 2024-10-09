const express = require("express");

const router = express?.Router();
const auth = require("../../middlewares/auth");
const validate = require("../../middlewares/validate");
const companySingUp = require("../../validation/company/companySingUp");
const companyUpdateValidation = require("../../validation/company/comapnyUpdate");

const {
  createCompany,
  getCompaniesGroupedByUser,
  updateCompany,
  deleteCompany,
} = require("../company/comapany.controller");

router.route("/create").post(auth, validate(companySingUp), createCompany);
router.route("/grouped-by-user").get(auth, getCompaniesGroupedByUser);
router.route("/:id").delete(auth, deleteCompany);
router
  .route("/:id")
  .put(auth, validate(companyUpdateValidation), updateCompany);

module.exports = router;
