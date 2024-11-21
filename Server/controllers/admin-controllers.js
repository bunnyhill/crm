const pool = require('../db');
const bcrypt = require('bcrypt');

module.exports.loginAdmin = async (req, res) => {
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
      const token = jwt.sign({ userId: user.userId }, process.env.TOKEN_KEY, {
        expiresIn: '365d',
      });
      return res.status(200).json({ message: 'Login successful', token });
    } catch (err) {
      console.error('Error generating token:', err.message);
      return res.status(500).json({ message: err.message });
    }
  } catch (err) {
    console.error('Error during login: ', err.message);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
