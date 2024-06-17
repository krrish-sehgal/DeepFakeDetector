const path = require("path");

const express = require("express");

const extensionController = require("../controllers/extension");

const router = express.Router();

router.post("/upload", extensionController.postUpload);

module.exports = router;
