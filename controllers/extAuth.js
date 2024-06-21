const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/user");
const secretKey = process.env.JWT_SECRET_KEY || "My secret";

exports.postLogin = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email: email });

    if (!user) {
      return res.status(401).json({ message: "Invalid email" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Wrong password" });
    }

    const token = jwt.sign(
      {
        userId: user._id.toString(),
      },
      secretKey,
      {
        expiresIn: "1m",
      }
    );
    console.log("Token: ", token);
    res.json({ token, userId: user._id.toString() });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
exports.getSignup = (req, res, next) => {
  res.render("auth/signup", {
    extension: true,
    pageTitle: "Sign Up",
  });
};
