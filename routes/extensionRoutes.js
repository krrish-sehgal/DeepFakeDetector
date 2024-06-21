const path = require("path");

const express = require("express");

const extensionController = require("../controllers/extension");

const router = express.Router();

const isAuth = require("../middleware/is-ext-auth");

router.get("/", extensionController.getIndex);

router.post("/upload", isAuth.verifyToken, extensionController.postUpload);

module.exports = router;
