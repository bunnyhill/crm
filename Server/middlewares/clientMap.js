const clientMap = (req, res, next) => {
  const hmap = {
    '192.168.29.51': 'Hafeez',
    '192.168.29.49': 'Devdath',
    '192.168.29.184': 'Devdath',
    '192.168.29.37': 'Arjun',
  };

  const clientName = hmap[req.ip] || 'unknown';

  console.log('-------------------------------------');
  console.log(`Client -  ${req.ip}, Name: ${clientName}`);

  console.log('Request - ', req.method, req.url);

  next();
};

module.exports = clientMap;
