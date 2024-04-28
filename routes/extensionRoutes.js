
const path = require('path');

const express = require('express');

const extensionController = require('../controllers/extension');

const router = express.Router();

router.post('/upload', extensionController.postUpload);

// router.post('/predict', adminController.postPredict);

module.exports = router;
