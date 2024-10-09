const jwt = require("jsonwebtoken");
const User = require("../api/user/user.model");

const authentication = async (req, res, next) => {
  try {
    // Check if the authorization header exists
    const authHeader = req.headers["authorization"];
    if (!authHeader) {
      return res
        .status(401)
        .json({ message: "Access token required", status: false });
    }

    // Split the token and check its format
    const [scheme, token] = authHeader.split(" ");
    if (!token || scheme !== "Bearer") {
      return res.status(403).json({ message: "Invalid token", status: false });
    }

    // Verify the token
    const verifyToken = jwt.verify(token, process?.env?.JWT_SECRET);
    const existUser = await User.findOne({
      _id: verifyToken.id,
      isActive: true,
    });
    if (!existUser) {
      return res.status(403).json({ message: "Invalid token", status: false });
    }
    req.user = existUser;

    // Proceed to the next middleware
    next();
  } catch (error) {
    console.error("Error during authentication:", error);

    if (error.name === "JsonWebTokenError") {
      return res.status(403).json({ message: "Invalid token", status: false });
    }

    if (error.name === "TokenExpiredError") {
      return res.status(403).json({ message: "Token expired", status: false });
    }

    // Handle other errors
    return res.status(500).json({ message: "Server error", status: false });
  }
};

module.exports = authentication;
