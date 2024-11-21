const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config({ path: './.env' });

const app = express();

app.use(cors());
app.use(express.json());

app.use(express.static('public'));

const routes = require('./routes');
app.use(routes);

app.listen(process.env.PORT, () => {
  console.log(`Server is running on port : ${process.env.PORT}`);
});
