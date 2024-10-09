const Rooms = require("../room/room.modal");

const createRoom = async (req, res) => {
  try {
    const newRoom = new Rooms(req.body);
    const createdRoom = await newRoom.save();
    if (createdRoom)
      res.status(200).json({
        message: "Room created successfully.",
        data: createdRoom,
        status: true,
      });
  } catch (error) {
    res.status(500).json({
      message: "Internal server error.",
      error: error.message,
      status: false,
    });
  }
};

module.exports = { createRoom };
