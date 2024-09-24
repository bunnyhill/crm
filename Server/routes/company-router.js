const express = require('express');
const controller = require('../controllers/company-controllers');
const verifyToken = require('../middlewares/verifyToken');

const router = express.Router();

router.get('/overview', verifyToken(['Company']), controller.overview);

module.exports = router;
