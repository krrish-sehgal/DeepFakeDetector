const path = require("path");

const express = require("express");

const websiteController = require("../controllers/website");

const router = express.Router();

router.get("/", websiteController.getIndex);

router.post("/predict", websiteController.postPredict);

router.get("/signup", (req, res) => {
  res.render("signup", {
    pageTitle: "Sign Up",
  });
});
router.get("/login", (req, res) => {
  res.render("login", {
    pageTitle: "Login",
  });
});
router.get("/history", (req, res) => {
    res.render("history", {
      pageTitle: "History",
    });
  });
module.exports = router;
