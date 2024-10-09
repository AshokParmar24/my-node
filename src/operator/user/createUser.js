const User = require("../../api/user/user.model");

const createUser = async (data) => {
  try {
    const newUser = new User(data);
    const savedUser = await newUser.save(); // Save the new user document to the database
    return savedUser;
  } catch (error) {
    throw error;
  }
};

module.exports = { createUser };
