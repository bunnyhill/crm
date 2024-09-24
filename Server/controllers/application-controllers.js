const pool = require('../db');

module.exports.createApplication = async (req, res) => {
  console.log('Payload - ', req.body);

  try {
    const { userId } = req;
    const { jobId } = req.body;
    const [rows] = await pool.query(
      'INSERT INTO applications (userId, jobId, status) VALUES (?, ?, ?)',
      [userId, jobId, 'Submitted']
    );
    res
      .status(201)
      .json({ message: 'Application Created', applicationId: rows.insertId });
  } catch (err) {
    console.error('Error GET /application/create', err.message);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
module.exports.getApplicationsByCompanyId = async (req, res) => {
  console.log('Query - ', req.query);

  try {
    const { userId } = req;
    const { status } = req.query;
    const [rows] = await pool.query(
      `SELECT a.applicationId, 
        a.created_at, 
        u1.name AS companyName, 
        u2.name AS applicantName,
        u2.userId,
        j.location AS location,
        j.title AS designation,
        u2.resumeLink,
        a.status
       FROM applications a 
       JOIN jobs j ON a.jobId = j.jobId
       JOIN users u1 ON j.userId = u1.userId 
       JOIN users u2 ON a.userId = u2.userId 
       WHERE j.userId = ? AND status = ?`,
      [userId, status]
    );
    res.status(200).json({ message: 'Response Received', data: rows });
  } catch (err) {
    console.error('Error GET /application/c/', err.message);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
module.exports.getApplicationsByJobId = async (req, res) => {
  console.log('Params - ', req.params);

  try {
    const { jobId } = req.params;
    const [rows] = await pool.query(
      `SELECT a.applicationId, 
        a.created_at, 
        u1.name AS companyName, 
        u2.name AS applicantName,
        j.location AS location,
        j.title AS designation,
        u1.resumeLink,
        a.status
       FROM applications a 
       JOIN jobs j ON a.jobId = j.jobId
       JOIN users u1 ON j.userId = u1.userId 
       JOIN users u2 ON a.userId = u2.userId 
       WHERE j.jobId = ?`,
      [jobId]
    );
    res.status(200).json({ message: 'Response Received', data: rows });
  } catch (err) {
    console.error('Error GET /application/j/:jobId', err.message);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

//-----------------------CRUD Controllers-----------------------------

module.exports.getAllApplications = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM applications');
    res.status(200).json({ message: 'Response Received', data: rows });
  } catch (err) {
    console.error('Error GET /application/', err.message);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
module.exports.getApplicationById = async (req, res) => {
  console.log('Params - ', req.params);

  try {
    const { applicationId } = req.params;
    const [rows] = await pool.query(
      'SELECT * FROM applications WHERE applicationId = ?',
      [applicationId]
    );
    res.status(200).json({ message: 'Response Received', data: rows[0] });
  } catch (err) {
    console.error('Error GET /application/:applicationId', err.message);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
module.exports.patchApplicationById = async (req, res) => {
  console.log('Params - ', req.params);
  console.log('Payload - ', req.body);

  try {
    const { applicationId, jobId } = req.params;
    const { newStatus } = req.body;

    const [response] = await pool.query(
      'UPDATE applications SET status = ? WHERE applicationId = ?',
      [newStatus, applicationId]
    );

    if (response.affectedRows == 0) {
      return res.status(404).json({ message: 'Application Not Found' });
    }

    if (newStatus.toLowerCase() == 'selected') {
      const [vacancyDecrementResponse] = await pool.query(
        'UPDATE jobs SET vacancy = vacancy - 1 WHERE jobId = ?',
        [jobId]
      );
    }
    res
      .status(200)
      .json({ message: 'Application Status Updated', success: true });
  } catch (err) {
    console.error('Error PATCH /application/:applicationId', err.message);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
module.exports.deleteApplicationById = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const response = await pool.query(
      'DELETE FROM applications WHERE applicationId = ?',
      [applicationId]
    );
    if (response[0].affectedRows == 0) {
      return res.status(404).json({ message: 'Application Not Found' });
    }
    res.status(200).json({ message: 'Application Deleted ' });
  } catch (err) {
    console.error('Error DELETE /application/:applicationId', err.message);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
