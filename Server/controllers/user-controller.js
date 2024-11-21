const pool = require('../db');

module.exports.signupUser = async (req, res) => {
  console.log('Payload -', req.body);

  try {
    const {
      mobile,
      email,
      name,
      address,
      dob,
      lastCommunicated,
      subscription,
    } = req.body;

    const queryCheckUser = 'SELECT * FROM users WHERE email = ?';
    const [rows] = await pool.query(queryCheckUser, [email]);

    if (rows.length > 0) {
      return res.status(403).json({ message: 'Username already taken' });
    }

    const queryUserInsert = `
      INSERT INTO users (mobile, email, name, address, dob) 
      VALUES (?, ?, ?, ?, ?)
    `;

    const placeholdersUser = [mobile, email, name, address, dob];

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
