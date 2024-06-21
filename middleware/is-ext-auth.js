const jwt = require("jsonwebtoken");
const secretKey = process.env.JWT_SECRET_KEY || "My secret";

exports.verifyToken = (req, res, next) => {
  const token = req.headers["authorization"];
  if (!token) {
    return res.status(403).json({ message: "No token provided" });
  }

  jwt.verify(token, secretKey, (err, decoded) => {
    if (err) {
      // generally if the token is expired or invalid
      console.log(err);
      return res.status(500).json({ message: "Failed to authenticate token" });
    }
    req.userId = decoded.userId;
    next();
  });
};
