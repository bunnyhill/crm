const express = require('express');
const controller = require('../controllers/admin-controllers');

const router = express.Router();

router.post('/login', controller.loginAdmin);

module.exports = router;
