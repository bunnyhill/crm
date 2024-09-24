import './companyhomepage.css';

// import components
import Navbar from '../../components/Navbar';
import Logo from '../../components/Logo';
import Popup from '../../components/PopUp';

//import functions
import React, { useEffect, useState } from 'react';
import instance from '../../utils/axiosconfig';

const CompanyHomePage = () => {
  const [company, setCompany] = useState({});
  const [submittedApplications, setSubmittedApplications] = useState([]);
  const [selectedApplications, setSelectedApplications] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [selectedApplicant, setSelectedApplicant] = useState(null);

  const fetchCompanyDetails = async () => {
    const response = await instance.get(`/user/loggedIn`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
    setCompany(response.data.user);
  };

  const fetchSubmittedApplicants = async () => {
    const submittedResponse = await instance.get(
      '/application/c?status=submitted',
      {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      }
    );
    setSubmittedApplications(submittedResponse.data.data);
  };

  const fetchSelectedApplicants = async () => {
    const selectedResponse = await instance.get(
      '/application/c?status=selected',
      {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      }
    );
    setSelectedApplications(selectedResponse.data.data);
  };
  const onSelectBtn = async (e, applicationId) => {
    const response = await instance.patch(`/application/${applicationId}`, {
      newStatus: 'selected',
    });
    if (response.data.success) {
      fetchSubmittedApplicants();
      fetchSelectedApplicants();
    }
  };

  const onRejectBtn = async (e, applicationId) => {
    const response = await instance.patch(`/application/${applicationId}`, {
      newStatus: 'rejected',
    });
    if (response.data.success) {
      fetchSubmittedApplicants();
      fetchSelectedApplicants();
    }
  };

  const onViewDetailsClick = async (e, userId) => {
    const response = await instance.get(`/user/${userId}`);
    setSelectedApplicant(response.data.user);
    setShowPopup(true);
  };

  const closePopup = () => {
    setShowPopup(false);
    setSelectedApplicant(null);
  };

  // console.log('company', company);

  useEffect(() => {
    fetchCompanyDetails();
    fetchSubmittedApplicants();
    fetchSelectedApplicants();
  }, []);

  return (
    <div className="company-home-page">
      <Logo />
      <Navbar image={company.profile_image} />
      <div className="table-container">
        <div className="left-table">
          <table className="table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Applicant name</th>
                <th>Location</th>
                <th>Designation</th>
                <th>Resume</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {submittedApplications.map((app, index) => (
                <tr key={index}>
                  <td>{app.created_at.split('T')[0]}</td>
                  <td>{app.applicantName}</td>
                  <td>{app.location}</td>
                  <td>{app.designation}</td>
                  <td>
                    <a href={`http://localhost:8000${app.resumeLink}`}>
                      {app.resumeLink
                        ? app.resumeLink.split('/')[2]
                        : 'not uploaded'}
                    </a>
                  </td>
                  <td>
                    <button
                      className="select-btn"
                      onClick={e => {
                        onSelectBtn(e, app.applicationId);
                      }}
                    >
                      Select
                    </button>
                    <button
                      className="reject-btn"
                      onClick={e => {
                        onRejectBtn(e, app.applicationId);
                      }}
                    >
                      Reject
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="right-table">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Designation</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {selectedApplications.map((app, index) => (
                <tr key={index}>
                  <td>{app.applicantName}</td>
                  <td>{app.designation}</td>
                  <td>
                    <button
                      className="view-details-btn"
                      onClick={e => onViewDetailsClick(e, app.userId)}
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {showPopup && selectedApplicant && (
        <Popup applicant={selectedApplicant} onClose={closePopup} />
      )}
    </div>
  );
};

export default CompanyHomePage;
