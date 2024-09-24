const pool = require('../db');

module.exports.addJob = async (req, res) => {
  console.log('Payload - ', req.body);

  try {
    const { userId } = req;
    const {
      title,
      job_summary,
      experience_level,
      vacancy,
      location,
      job_mode,
      salary,
      job_type,
      key_responsibilities,
      job_requirements,
    } = req.body;

    const query = `
      INSERT INTO jobs (
        userId, title, job_summary, experience_level, vacancy, location, 
        job_mode, salary, job_type, key_responsibilities, job_requirements 
      ) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = await pool.query(query, [
      userId,
      title,
      job_summary,
      experience_level,
      vacancy,
      location,
      job_mode,
      salary,
      job_type,
      JSON.stringify(key_responsibilities),
      JSON.stringify(job_requirements),
    ]);

    res
      .status(201)
      .json({ message: 'Job added successfully', jobId: result.insertId });
  } catch (err) {
    console.error('Error /job/addJob', err.message);
    res.status(500).json({ message: 'Internal Server Error', err });
  }
};
module.exports.filterJob = async (req, res) => {
  try {
    const {
      page = 1,
      jobType = '',
      minSalary = 0,
      maxSalary = Infinity,
      experienceLevel = '',
      workMode = '',
      location = '',
    } = req.query;

    const { userId } = req;
    if (!userId) {
      return res
        .status(400)
        .json({ message: 'User ID is required to check application status.' });
    }

    const parsedPage = parseInt(page, 10);
    const rowCount = 8;
    const offset = (parsedPage - 1) * rowCount;

    let query = `
      SELECT
        jobs.*,
        users.name AS company_name,
        users.company_website,
        users.profile_image AS company_profile_image,
        users.userId AS companyId,
        COALESCE(applications.status, 'Apply for this Job') AS application_status
      FROM jobs
      JOIN users ON jobs.userId = users.userId
      LEFT JOIN applications ON jobs.jobId = applications.jobId AND applications.userId = ?
      WHERE 1=1
    `;

    const params = [userId];

    if (jobType) {
      const jobTypes = jobType.split(',').map(type => type.trim());
      query += ` AND jobs.job_type IN (${jobTypes.map(() => '?').join(',')})`;
      params.push(...jobTypes);
    }

    if (minSalary || maxSalary < Infinity) {
      query += ' AND jobs.salary BETWEEN ? AND ?';
      params.push(minSalary, maxSalary);
    }

    if (experienceLevel) {
      const experienceLevels = experienceLevel
        .split(',')
        .map(level => level.trim());
      query += ` AND jobs.experience_level IN (${experienceLevels
        .map(() => '?')
        .join(',')})`;
      params.push(...experienceLevels);
    }

    if (workMode) {
      const workModes = workMode.split(',').map(mode => mode.trim());
      query += ` AND jobs.job_mode IN (${workModes.map(() => '?').join(',')})`;
      params.push(...workModes);
    }

    if (location) {
      const locations = location.split(',').map(loc => loc.trim());
      query += ` AND jobs.location IN (${locations.map(() => '?').join(',')})`;
      params.push(...locations);
    }
    const [totalFilteredJobs] = await pool.query(query, params);

    query += ' ORDER BY jobs.created_at DESC LIMIT ?, ?';
    params.push(offset, rowCount);

    const [rows] = await pool.query(query, params);

    res.status(200).json({
      message: 'Filter Success',
      data: rows,
      totalJobs: totalFilteredJobs.length,
      jobInPage: rows.length,
    });
  } catch (err) {
    console.error('Error /job/filter:', err.message);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
module.exports.dropBox = async (req, res) => {
  const dropBox = { jobType: [], experience: [], location: [], workMode: [] };
  try {
    const [jobTypeResults] = await pool.query(
      'select DISTINCT job_type from jobs'
    );
    dropBox.jobType = jobTypeResults.map(job => job.job_type);
    const [experienceResults] = await pool.query(
      'select DISTINCT experience_level from jobs'
    );
    dropBox.experience = experienceResults.map(job => job.experience_level);
    const [locationResults] = await pool.query(
      'select DISTINCT location from jobs'
    );
    dropBox.location = locationResults.map(job => job.location);
    const [workModeResults] = await pool.query(
      'select DISTINCT job_mode from jobs'
    );
    dropBox.workMode = workModeResults.map(job => job.job_mode);
    res.status(200).json({ message: 'Success', dropBox });
  } catch (err) {
    console.log('Error /job/filter', err.message);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
module.exports.jobVacancyDecrement = async (req, res) => {
  console.log('Request - PATCH /job/vacancy/:jobId');
  console.log('Params - ', req.params);

  try {
    const { jobId } = req.params;
    const [vacancy] = await pool.query(
      'SELECT vacancy FROM jobs WHERE jobId = ?',
      [jobId]
    );

    if (vacancy[0].vacancy === 0) {
      return res.status(200).json({ message: 'Vacancy Already zero' });
    }
    const [result] = await pool.query(
      `UPDATE jobs SET vacancy = vacancy - 1 WHERE jobId = ?`,
      [jobId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Job Not Found' });
    }

    res
      .status(200)
      .json({ message: 'Vacancy Decremented', vacancy: vacancy[0].vacancy });
  } catch (err) {
    console.log('Error in PATCH /job/vacancy', err.message);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
module.exports.allJobs = async (req, res) => {
  const [rows] = await pool.query(`    
      SELECT 
        jobs.*,
        users.name AS company_name, 
        users.company_website,
        users.profile_image AS company_profile_image,
        users.userId AS companyId,
        COALESCE(applications.status, 'Apply for this Job') AS application_status
      FROM jobs 
      JOIN users ON jobs.userId = users.userId
      LEFT JOIN applications ON jobs.jobId = applications.jobId AND applications.userId = 41
      WHERE 1=1`);
  res.status(200).json({ message: 'All Jobs', data: rows });
};

//-----------------------CRUD Controllers-----------------------------

module.exports.getAllJobs = async (req, res) => {
  console.log('-------------------------------------');
  console.log('GET /job/');

  try {
    const [rows] = await pool.query(
      `SELECT j.*, u.userId companyId ,u.name company_name, u.profile_image company_profile_image
       FROM jobs j
       JOIN users u ON j.userId = u.userId
      `
    );

    res.status(200).json({ message: 'Success', data: rows });
  } catch (err) {
    console.error('Error /job/', err.message);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
module.exports.getJobById = async (req, res) => {
  try {
    const { jobId } = req.params;
    const [rows] = await pool.query('SELECT * FROM jobs WHERE jobId = ?', [
      jobId,
    ]);

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Job not found' });
    }

    res.status(200).json({ message: 'success', data: rows[0] });
  } catch (err) {
    console.error('Error in /job/:id', err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
module.exports.postJobById = async (req, res) => {
  console.log('Params - ', req.params);
  console.log('Payload - ', req.body);

  try {
    const { jobId } = req.params;
    const { companyId } = req.body;

    // Check if companyId is provided
    if (!companyId) {
      return res.status(400).json({ message: 'Company ID is required' });
    }

    // Fetch job details
    const [jobDetails] = await pool.query(
      'SELECT * FROM jobs WHERE jobId = ?',
      [jobId]
    );

    // Fetch company details
    const [companyDetails] = await pool.query(
      'SELECT profile_image, name, about_company, company_website FROM users WHERE userId = ?',
      [companyId]
    );

    res.status(200).json({
      message: 'Success',
      jobDetails: jobDetails[0],
      companyDetails: companyDetails[0],
    });
  } catch (err) {
    console.error('Error /job/:jobId', err.message);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
module.exports.patchJobById = async (req, res) => {
  try {
    const { jobId } = req.params;
    const {
      title,
      job_summary,
      experience_level,
      vacancy,
      location,
      job_mode,
      salary,
      job_type,
      key_responsibilities,
      job_requirements,
    } = req.body;

    const query = `
      UPDATE jobs
      SET
        title = COALESCE(?, title),
        job_summary = COALESCE(?, job_summary),
        experience_level = COALESCE(?, experience_level),
        vacancy = COALESCE(?, vacancy),
        location = COALESCE(?, location),
        job_mode = COALESCE(?, job_mode),
        salary = COALESCE(?, salary),
        job_type = COALESCE(?, job_type),
        key_responsibilities = COALESCE(?, key_responsibilities),
        job_requirements = COALESCE(?, job_requirements)
      WHERE jobId = ?
    `;

    const params = [
      title,
      job_summary,
      experience_level,
      vacancy,
      location,
      job_mode,
      salary,
      job_type,
      JSON.stringify(key_responsibilities),
      job_requirements,
      jobId,
    ];

    const [result] = await pool.query(query, params);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Job not found' });
    }

    res.status(200).json({ message: 'Job updated successfully' });
  } catch (err) {
    console.error('Error PATCH /job/:jobId', err.message);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
module.exports.deleteJobById = async (req, res) => {
  try {
    const { jobId } = req.params;

    const query = 'DELETE FROM jobs WHERE jobId = ?';

    const [result] = await pool.query(query, [jobId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Job not found' });
    }

    res.status(200).json({ message: 'Job deleted successfully' });
  } catch (err) {
    console.error('Error DELETE /job/:jobId:', err.message);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
