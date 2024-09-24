const express = require('express');
const controller = require('../controllers/admin-controllers');
const verifyToken = require('../middlewares/verifyToken');

const router = express.Router();

router.get(
  '/c/pending',
  verifyToken(['Admin']),
  controller.getPendingCompanies
);
router.get(
  '/c/approved',
  verifyToken(['Admin']),
  controller.getApprovedCompanies
);
router.patch(
  '/c/approve/:companyId',
  verifyToken(['Admin']),
  controller.approveCompany
);
router.patch(
  '/c/status/:companyId',
  verifyToken(['Admin']),
  controller.updateAdminStatus
);
router.get(
  '/c/:companyId',
  verifyToken(['Admin']),
  controller.getCompanyDetails
);

module.exports = router;
