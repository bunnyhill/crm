const express = require('express');
const controller = require('../controllers/user-controller');
const upload = require('../middlewares/imageUpload');
const verifyToken = require('../middlewares/verifyToken');

const router = express.Router();

// API Prefix - /user
router.post('/sign-up', upload.single('image'), controller.signupUser);
router.post('/login', controller.loginUser);
router.post('/forgot-password', controller.forgotPasswordUser);
router.post(
  '/resume/',
  verifyToken(['Applicant']),
  upload.single('resume'),
  controller.resume
); // verifyToken(['Applicant']),

//-------------------------CRUD APIs-----------------------------

router.get('/', controller.getAllUsers); // verifyToken(['Admin'])
router.patch('/', verifyToken(['Company']), controller.patchUserById); // verifyToken(['Admin'])
router.get(
  '/loggedIn',
  verifyToken(['Applicant', 'Company', 'Admin']),
  controller.loggedUserDetails
);
router.get('/:userId', controller.getUserById); // verifyToken(['Admin])
router.delete('/:userId', controller.deleteUserById); // verifyToken(['Admin'])

module.exports = router;
