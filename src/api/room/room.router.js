const express = require("express");
const auth = require("../../middlewares/auth");
const validate = require("../../middlewares/validate");
const roomCreateValidation = require("../../validation/room/roomCreate");

const router = express?.Router();

const { createRoom } = require("../room/room.controller");

router.route("/create").post(auth, validate(roomCreateValidation), createRoom);

module.exports = router;
