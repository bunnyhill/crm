import './popup.css';

const Popup = ({ applicant, onClose }) => {
  console.log(applicant);

  return (
    <div className="popup-overlay" onClick={onClose}>
      <div className="popup-content" onClick={e => e.stopPropagation()}>
        <button className="popup-close-btn" onClick={onClose}>
          &times;
        </button>
        <div className="popup-body">
          <img
            src={
              applicant.profile_image
                ? `http://localhost:8000${applicant.profile_image}`
                : '/images/cropped-KBN-logo-new-160x53 1.png'
            }
            alt="Applicant"
          />
          <h3>{applicant.name}</h3>
          <p>Designation:</p>
          <p>Contact No: {applicant.contact}</p>
          <a
            href={`http://localhost:8000${applicant.resumeLink}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            View Resume
          </a>
          <button
            className="contact-btn"
            onClick={() => alert('Contact via Mail')}
          >
            Contact via Mail
          </button>
        </div>
      </div>
    </div>
  );
};

export default Popup;
