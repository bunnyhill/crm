const pool = require('../db');

//----------Admin  controllers-----------------//

module.exports.getPendingCompanies = async (req, res) => {
  try {
    const [companies] = await pool.query(
      "SELECT userId, name, company_website FROM users WHERE role = 'company' AND company_isApproved = 0"
    );
    res.status(200).json({ message: '/admin/c/pending', data: companies });
  } catch (err) {
    console.error('Error fetching pending companies', err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
module.exports.getCompanyDetails = async (req, res) => {
  console.log('Params - ', req.params);
  try {
    const { companyId } = req.params;
    const [company] = await pool.query(
      "SELECT name, profile_image, about_company, company_website FROM users WHERE userId = ? AND role = 'Company'",
      [companyId]
    );
    if (company.length === 0) {
      return res.status(404).json({ message: 'Company Not Found' });
    }
    res.status(200).json({ message: 'Success', data: company[0] });
  } catch (err) {
    console.error('Error fetching company details', err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
module.exports.approveCompany = async (req, res) => {
  try {
    const { companyId } = req.params;
    const kbnCode = `KBN - ${Math.floor(100000 + Math.random() * 900000)}`;

    const response = await pool.query(
      "UPDATE users SET company_isApproved = 1,last_admin_status = now(), kbn_code = ? WHERE userId = ? AND role = 'Company'",
      [kbnCode, companyId]
    );

    if (response.affectedRows === 0) {
      return res.status(404).json({ message: 'Company Not Found' });
    }

    res.status(200).json({ message: 'Company Approved', kbn_code: kbnCode });
  } catch (err) {
    console.error('Error approving company', err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
module.exports.getApprovedCompanies = async (req, res) => {
  try {
    const [companies] = await pool.query(
      "SELECT userId, last_admin_status, name, kbn_code, company_website, business_type, admin_status FROM users WHERE role = 'Company' AND company_isApproved = 1 AND admin_status = 'pending' "
    );

    if (companies.length === 0) {
      return res.status(404).json({ message: 'Company Not Found' });
    }

    res.status(200).json({ message: '/admin/c/approved', data: companies });
  } catch (err) {
    console.error('Error /admin/c/approved', err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
module.exports.updateAdminStatus = async (req, res) => {
  try {
    const { companyId } = req.params;
    const { admin_status } = req.body;
    console.log(companyId, admin_status);

    const response = await pool.query(
      "UPDATE users SET admin_status = ? WHERE userId = ? AND role = 'Company'",
      [admin_status, companyId]
    );
    if (response.affectedRows === 0) {
      return res.status(404).json({ message: 'Company Not Found' });
    }
    res.status(200).json({ message: 'Status Updated' });
  } catch (err) {
    console.error('Error updating admin status', err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
