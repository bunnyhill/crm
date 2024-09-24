import './userhomepage.css';
import Navbar from '../../components/Navbar';
import Logo from '../../components/Logo';
import JobCard from '../../components/JobCard';
import { useEffect, useState } from 'react';
import instance from '../../utils/axiosconfig';

const UserHomePage = () => {
  const [user, setUser] = useState({});
  const [jobs, setJobs] = useState([]);
  const [dropbox, setDropbox] = useState({});
  const [filter, setFilter] = useState({});

  const fetchUserDetails = async () => {
    const response = await instance.get(`/user/loggedIn`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
    setUser(response.data.user);
  };

  const fetchAllJobs = async () => {
    const response = await instance.get('/job/filter', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      params: filter,
    });
    setJobs(response.data.data);
  };

  const fetchDropbox = async () => {
    const response = await instance.get('/job/dropbox', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
    setDropbox(response.data.dropBox);
  };

  const onFilterChange = (e, type) => {
    const value = e.target.value;
    if (
      value === 'Job Type' ||
      value === 'Experience Level' ||
      value === 'Work Mode' ||
      value === 'Location'
    ) {
      setFilter({ ...filter, [type]: '' });
    } else if (value === 'Salary') {
      setFilter({ ...filter, [type]: 0 });
    } else {
      setFilter({ ...filter, [type]: value });
    }
  };
  // console.log('filter', filter);
  console.log('user', user);
  // console.log('jobs', jobs);
  // console.log('dropbox', dropbox);

  useEffect(() => {
    fetchUserDetails();
    fetchAllJobs();
    fetchDropbox();
  }, [filter]);

  return (
    <div className="user-home-page">
      <Logo />
      <Navbar image={user.profile_image} />
      <div className="jobs-filter-container">
        <select
          onChange={e => {
            onFilterChange(e, 'jobType');
          }}
          name="job-type"
        >
          <option>Job Type</option>
          {dropbox?.jobType?.map((item, index) => (
            <option key={index}>{item}</option>
          ))}
        </select>
        <select
          onChange={e => {
            onFilterChange(e, 'salary');
          }}
          name="salary"
        >
          <option>Salary</option>
        </select>
        <select
          onChange={e => {
            onFilterChange(e, 'experienceLevel');
          }}
          name="experience-level"
        >
          <option>Experience Level</option>
          {dropbox?.experience?.map((item, index) => (
            <option key={index}>{item}</option>
          ))}
        </select>
        <select
          onChange={e => {
            onFilterChange(e, 'workMode');
          }}
          name="work-mode"
        >
          <option>Work Mode</option>
          {dropbox?.workMode?.map((item, index) => (
            <option key={index}>{item}</option>
          ))}
        </select>
        <select
          onChange={e => {
            onFilterChange(e, 'location');
          }}
          name="location"
        >
          <option>Location</option>
          {dropbox?.location?.map((item, index) => (
            <option key={index}>{item}</option>
          ))}
        </select>
      </div>
      <h3>Latest Jobs</h3>
      <br />
      <div className="jobs-card-container">
        {jobs.length ? (
          jobs.map((item, index) => <JobCard key={index} item={item} />)
        ) : (
          <h1>No Jobs</h1>
        )}
      </div>
    </div>
  );
};

export default UserHomePage;
