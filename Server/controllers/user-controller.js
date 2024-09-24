const pool = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

module.exports.signupUser = async (req, res) => {
  console.log('Payload -', req.body);

  try {
    const { role, name, email, password, contact } = req.body;

    // Check if the email already exists
    const queryCheckUser = 'SELECT * FROM users WHERE email = ?';
    const [rows] = await pool.query(queryCheckUser, [email]);

    if (rows.length > 0) {
      return res.status(403).json({ message: 'Username already taken' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Construct the image URL
    const imageLink = req.file ? `/uploads/${req.file.filename}` : null;

    // Insert new user
    const queryUserInsert = `
      INSERT INTO users (role, name, email, hpassword, profile_image, contact) 
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    const placeholdersUser = [
      role,
      name,
      email,
      hashedPassword,
      imageLink,
      contact,
    ];

    const [responseUser] = await pool.query(queryUserInsert, placeholdersUser);

    // API Response
    res.status(201).json({
      message: 'User Created Successfully',
      user_id: responseUser.insertId,
    });
  } catch (err) {
    console.error('Error during signup', err.message);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
module.exports.loginUser = async (req, res) => {
  console.log('Payload -', req.body);

  try {
    const { email, password } = req.body;
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [
      email,
    ]);

    // if username doesnt exist
    if (rows.length === 0) {
      return res.status(401).json({ message: 'Invalid email' });
    }

    const user = rows[0];

    // password verification
    try {
      const isMatching = await bcrypt.compare(password, user.hpassword);

      if (!isMatching) {
        return res.status(401).json({ message: 'Wrong password' });
      }
    } catch (err) {
      console.error('Error comparing passwords:', err.message);
      return res.status(500).json({ message: err.message });
    }

    // generating the verification token for user to login in
    try {
      const token = jwt.sign(
        { userId: user.userId, role: user.role },
        process.env.TOKEN_KEY,
        { expiresIn: '365d' }
      );
      return res
        .status(200)
        .json({ message: 'Login successful', token, role: user.role });
    } catch (err) {
      console.error('Error generating token:', err.message);
      return res.status(500).json({ message: err.message });
    }
  } catch (err) {
    console.error('Error during login: ', err.message);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
module.exports.loggedUserDetails = async (req, res) => {
  try {
    const { userId, role } = req;

    let query = '';
    if (role === 'Applicant') {
      query = `SELECT name, email, profile_image, contact, address, resumeLink FROM users WHERE userId = ?`;
    } else if (role === 'Company') {
      query = `SELECT name, email, profile_image, contact, address, 
                   kbn_code, business_type, about_company, company_website, company_isApproved, admin_status
                   FROM users WHERE userId = ?`;
    } else if (role === 'Admin') {
      query = `SELECT name, profile_image FROM users WHERE userId = ?`;
    }
    const [rows] = await pool.query(query, [userId]);
    res.status(200).json({ message: 'Successful', user: rows[0] });
  } catch (err) {
    console.error('Error GET /user/loggedIn', err.message);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
module.exports.forgotPasswordUser = async (req, res) => {
  console.log('Payload -', req.body);

  try {
    const { email, newPassword, contact } = req.body;

    // Fetch the user from the database
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [
      email,
    ]);

    if (rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = rows[0];
    // Compare the provided contact number with the one in the database
    if (user.contact !== contact) {
      return res.status(403).json({ message: 'Incorrect contact number' });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the password in the database
    const updateQuery = 'UPDATE users SET hpassword = ? WHERE email = ?';
    await pool.query(updateQuery, [hashedPassword, email]);

    res.status(200).json({ message: 'Password reset successfully' });
  } catch (err) {
    console.error('Error POST /user/forgot-password:', err.message);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
module.exports.resume = async (req, res) => {
  console.log('Resume file - ', req.file.filename);

  try {
    const { userId } = req;
    const resumeLink = req.file ? `/uploads/${req.file.filename}` : null;
    const [response] = await pool.query(
      'UPDATE users SET resumeLink = ? WHERE userId = ?',
      [resumeLink, userId]
    );
    if (response.affectedRows === 0) {
      return res.status(404).json({ message: 'User Not Found' });
    }
    res.status(200).json({ message: 'file uploaded' });
  } catch (err) {
    console.error('Error POST /user/resume/:userId', err.message);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

//-----------------------CRUD Controllers-----------------------------

module.exports.getAllUsers = async (req, res) => {
  console.log('Request - GET /user/');
  console.log('Query - ', req.query);

  try {
    const { role = '' } = req.query;
    let query = `SELECT * FROM users`;
    const queryParams = [];
    if (role.toLowerCase() == 'company') {
      query += ` WHERE role = ? AND company_isApproved = 0`;
      queryParams.push(role);
    }

    const [rows] = await pool.query(query, queryParams);
    res.status(200).json({ message: 'Successful', data: rows });
  } catch (err) {
    console.error('Error GET /user/', err.message);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
module.exports.getUserById = async (req, res) => {
  console.log('Params - ', req.params);

  try {
    const { userId } = req.params;
    const [rows] = await pool.query(
      `SELECT userId, role, name, email, profile_image, contact, address, resumeLink
       FROM users WHERE userId = ${userId}`
    );
    res.status(200).json({ message: 'Successful', user: rows[0] });
  } catch (err) {
    console.error('Error GET /user/:userId', err.message);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
module.exports.patchUserById = async (req, res) => {
  try {
    const { userId } = req;
    console.log(req.body);
    const { address, contact, business_type, company_website } = req.body;
    let query = 'UPDATE users SET';
    let params = [];
    if (address != '') {
      query += ' address = ?';
      params.push(address);
    }
    if (contact != '') {
      query += ', contact = ?';
      params.push(contact);
    }
    if (business_type != '') {
      query += ', business_type = ?';
      params.push(business_type);
    }
    if (company_website != '') {
      query += ', company_website = ?';
      params.push(company_website);
    }
    query += ' WHERE userId = ?';
    params.push(userId);

    console.log(query);
    console.log(params);

    const [result] = await pool.query(query, params);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'User Not Found' });
    }
    res.status(200).json({ message: 'Updated' });
  } catch (err) {
    console.error('Error PATCH /user/', err.message);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
module.exports.deleteUserById = async (req, res) => {
  console.log('Request - DELETE /user/:userId');
  console.log('Params - ', req.params);

  try {
    const { userId } = req.params;
    const [rows] = await pool.query(
      `SELECT * FROM users WHERE userId = ${userId}`
    );
    if (rows[0].affectedRows === 0) {
      return res.status(404).json({ message: 'User Not Found' });
    }

    //code for deleting image

    //-----------------------------

    res.status(200).json({ message: 'User Deleted' });
  } catch (err) {
    console.error('Error in DELETE /user/:userId', err.message);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
