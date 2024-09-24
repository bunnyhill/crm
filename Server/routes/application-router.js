const express = require('express');
const controller = require('../controllers/application-controllers');
const verifyToken = require('../middlewares/verifyToken');

const router = express.Router();

//  API Prefix - /application
router.post(
  '/create',
  verifyToken(['Applicant']),
  controller.createApplication
);
router.get(
  '/c/',
  verifyToken(['Company']),
  controller.getApplicationsByCompanyId
);
router.get('/j/:jobId', controller.getApplicationsByJobId);

//-------------------------CRUD APIs-----------------------------

router.get('/', controller.getAllApplications); // verifyToken(['Admin']),
router.get('/:applicationId', controller.getApplicationById); // verifyToken(['Admin', 'Company', 'Applicant']),
router.patch('/:applicationId', controller.patchApplicationById); // verifyToken(['Admin', 'Company']),
router.delete('/:applicationId', controller.deleteApplicationById); // verifyToken(['Admin'])

module.exports = router;
