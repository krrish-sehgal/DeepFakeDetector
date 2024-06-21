const express = require("express");

const extAuthController = require("../controllers/extAuth");

const router = express.Router();

router.get("/signup", extAuthController.getSignup);

router.post("/login", extAuthController.postLogin);

module.exports = router;
