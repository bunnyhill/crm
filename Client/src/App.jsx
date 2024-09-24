import './App.css';

import LoginPage from './pages/LoginPage';
import UserHomePage from './pages/UserHomePage';
import CompanyHomePage from './pages/CompanyHomePage';
import AdminHomePage from './pages/AdminHomePage';

import { Routes, Route } from 'react-router-dom';
import PrivateRoute from './components/PrivateRoute';

const App = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />}></Route>
      <Route path="/sign-up"></Route>
      <Route path="/forgot-password"></Route>

      <Route element={<PrivateRoute role="Applicant" />}>
        <Route path="/Applicant/home" element={<UserHomePage />}></Route>
        <Route path="/Applicant/job/:jobId"></Route>
      </Route>

      <Route element={<PrivateRoute role="Company" />}>
        <Route path="/Company/home" element={<CompanyHomePage />}></Route>
        <Route path="/Company/profile"></Route>
        <Route path="/Company/t-and-c"></Route>
      </Route>

      <Route element={<PrivateRoute role="Admin" />}>
        <Route path="/Admin/home" element={<AdminHomePage />}></Route>
        <Route path="/Admin/t-and-c"></Route>
      </Route>
    </Routes>
  );
};

export default App;
