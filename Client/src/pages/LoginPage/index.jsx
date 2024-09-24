import './loginpage.css';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import axios from 'axios';

const Login = () => {
  const navigate = useNavigate();

  const [loginDetails, setLoginDetails] = useState({
    email: '',
    password: '',
  });

  const onchange = (e, key) => {
    setLoginDetails({ ...loginDetails, [key]: e.target.value });
  };

  const onBtnLogin = async () => {
    try {
      const response = await axios.post(
        `http://localhost:8000/user/login`,
        loginDetails
      );

      localStorage.setItem('token', response.data.token);
      localStorage.setItem('role', response.data.role);

      navigate(`/${localStorage.getItem('role')}/home`);
    } catch (err) {
      console.log(err.message);
    }
  };

  return (
    <div className="login-page">
      <div className="login-form">
        <div className="username-container">
          <label>Username</label>
          <input
            onChange={e => {
              onchange(e, 'email');
            }}
            type="text"
            placeholder="Username"
          />
        </div>
        <div className="password-container">
          <label>Password</label>
          <input
            onChange={e => {
              onchange(e, 'password');
            }}
            type="password"
            placeholder="Password"
          />
        </div>
        <button onClick={onBtnLogin}>Login</button>
      </div>
    </div>
  );
};
export default Login;
