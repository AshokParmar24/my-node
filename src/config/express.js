const express = require("express");
const indexRoute = require("../routes/index");
const { updateExpiredBookings } = require("../helper/bookingHelper");
const cron = require("node-cron");
const cors = require("cors");

const app = express();

app.use(express.json());
app.use(
  cors({
    origin: "*", // Allow all origins
  })
);

app.use("/api", indexRoute);

module.exports = app;
