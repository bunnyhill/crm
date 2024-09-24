const pool = require('../db');

module.exports.overview = async (req, res) => {
  // API JSON Response Format
  const pageData = {
    container1: {
      companyPosition: 0,
      applicantsTotal: { value: 0, growth: '' },
      applicantsSelected: { value: 0, growth: '' },
      mostAppliedJob: {
        title: '',
        applicantsCount: 0,
        percentage: 0.0,
        growth: '',
      },
      applicationGrowth: { value: 0, growth: '' },
    },
    container2: {
      recruitment: [
        {
          jobPost: '',
          currentMonth: { total: 0, selected: 0 },
          previousMonth: { total: 0, selected: 0 },
        },
      ],
      applicants: {
        currentMonth: { total: 0, selected: 0 },
        previousMonth: { total: 0, selected: 0 },
      },
    },
    container3: { jobName: '', vancancy: 0, selected: 0, status: '' },
  };

  // API Main Error Handling
  try {
    const { month, year } = req.query;
    const { userId } = req;
    const params = [year, month, userId];

    // For applicantsTotal and applicantsSelected keys in conatiner1
    const [query1Result] = await pool.query(
      `
          SELECT 
            COUNT(*) as total,
            COUNT(CASE WHEN status = 'SELECTED' THEN 1 END) as selected
          FROM applications
          WHERE YEAR(created_at) = ?
          AND MONTH(created_at) = ? 
          AND jobId IN (SELECT jobId from jobs where userId = ?)
        `,
      params
    );
    if (query1Result[0].total === 0) {
      return res
        .status(404)
        .json({ message: 'No applications for the company' });
    }
    pageData.container1.applicantsTotal.value = query1Result[0].total;
    pageData.container1.applicantsSelected.value = query1Result[0].selected;

    // For Growth calculation
    const prevMonth = month - 1;
    const prevYear = year;
    if (prevMonth === 0) {
      prevMonth = 12;
      prevYear -= 1;
    }
    const prevParams = [prevYear, prevMonth, userId];

    // For mostAppliedJob key in container1
    const [query2Result] = await pool.query(
      `
      SELECT j.title, 
        COUNT(a.applicationId) AS applicantsCount,
        (COUNT(a.applicationId) / ${pageData.container1.applicantsTotal.value}) * 100 AS percentage
      FROM 
        applications a
        JOIN jobs j ON a.jobId = j.jobId
      WHERE 
      YEAR(a.created_at) = ? 
      AND MONTH(a.created_at) = ? 
      AND j.userId = ?
      GROUP BY 
        j.title
      ORDER BY 
        applicantsCount DESC
      LIMIT 1`,
      params
    );

    pageData.container1.mostAppliedJob = query2Result[0];
    res.status(200).json({ message: 'Success', pageData });
  } catch (err) {
    console.log('Error /company/overview', err.message);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
