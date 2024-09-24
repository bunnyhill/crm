const express = require('express');
const controller = require('../controllers/job-controllers');
const verifyToken = require('../middlewares/verifyToken');

const router = express.Router();

//  API Prefix - /job
router.get('/filter', verifyToken(['Applicant']), controller.filterJob); // verifyToken(['Admin','Applicant'])
router.post('/addJob', verifyToken(['Company']), controller.addJob); // verifyToken(['Admin','Company'])
router.get('/dropbox', verifyToken(['Applicant']), controller.dropBox);
router.get('/all', controller.allJobs);

//-------------------------CRUD APIs-----------------------------

router.get('/', controller.getAllJobs); // verifyToken(['Admin', 'Applicant,'])
router.patch('/vacancy/:jobId', controller.jobVacancyDecrement); // verifyToken(['Applicant','Company'])
router.get('/:jobId', controller.getJobById); // verifyToken(['Admin','Applicant', 'Company']
router.post('/:jobId', controller.postJobById); // verifyToken(['Admin','Applicant', 'Company']
router.patch('/:jobId', controller.patchJobById); // verifyToken(['Admin', 'Company'])
router.delete('/:jobId', controller.deleteJobById); // verifyToken(['Admin, Company'])

module.exports = router;
