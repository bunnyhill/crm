const express = require('express');
const controller = require('../controllers/user-controller');

const router = express.Router();

router.post('/sign-up', controller.signupUser);

module.exports = router;
