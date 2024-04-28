
const path = require('path');

const express = require('express');

const websiteController = require('../controllers/website');

const router = express.Router();

router.get('/', websiteController.getIndex);

router.post('/predict', websiteController.postPredict);

module.exports = router;
