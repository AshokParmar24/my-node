const express = require("express");

const router = express?.Router();

const { generateSecrete, completePayment } = require("./stripe.controller");

router.route("/create-payment-intent").post(generateSecrete);
router.route("/complete-payment").post(completePayment);

module.exports = router;
