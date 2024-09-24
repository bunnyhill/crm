const jwt = require('jsonwebtoken');

const verifyToken = roleArr => {
  return (req, res, next) => {
    try {
      const bToken = req.headers.authorization;
      if (!bToken) {
        return res.status(403).json({ message: 'Unauthorized Token' });
      }

      const token = bToken.split(' ')[1];
      const isValid = jwt.verify(token, process.env.TOKEN_KEY);
      console.log('Token Payload - ', isValid);

      if (!roleArr.includes(isValid.role)) {
        return res.status(403).json({ message: 'Unauthorized Token' });
      }

      req.userId = isValid.userId;
      req.role = isValid.role;

      next();
    } catch (e) {
      return res.status(403).json({ message: 'Unauthorized Token' });
    }
  };
};

module.exports = verifyToken;
