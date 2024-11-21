const userRouter = require('./user-router');
const adminRouter = require('./admin-router.js');
const clientRouter = require('./client-router.js');

const express = require('express');
const router = express.Router();

router.use('/user', userRouter);
router.use('/admin', adminRouter);
router.use('/client', clientRouter);

module.exports = router;
