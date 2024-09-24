import axios from 'axios';

console.log(localStorage.getItem('token'));
console.log('asv');

var instance = axios.create({
  baseURL: `http://localhost:8000`,
  timeout: 3000,
  headers: {
    Authorization: `Bearer ${localStorage.getItem('token')}`,
  },
});

export default instance;
