import { Outlet, Navigate } from 'react-router-dom';

const PrivateRoute = props => {
  return localStorage.getItem('token') ? (
    <Outlet />
  ) : (
    <Navigate to={`/login`} />
  );
};

export default PrivateRoute;
