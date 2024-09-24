import './jobcard.css';

const JobCard = props => {
  const calculateTimeAgo = timestamp => {
    const createdAtDate = new Date(timestamp);
    const now = new Date();
    const timeDifference = Math.floor((now - createdAtDate) / 1000); // in seconds

    const days = Math.floor(timeDifference / 86400); // 86400 seconds in a day
    const hours = Math.floor((timeDifference % 86400) / 3600); // remaining hours

    if (days > 0) {
      return `${days} day${days > 1 ? 's' : ''} ago`;
    }
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  };

  return (
    <div className="jobcard">
      <div className="top">
        <img src={`http://localhost:8000${props.item.company_profile_image}`} />
        <div>
          <h3>{props.item.title}</h3>
          <h3>{props.item.company_name}</h3>
        </div>
      </div>
      <p className="job_summary">{props.item.job_summary}</p>
      <br />
      <div className="mid">
        <button className="mid-p-tag">{props.item.experience_level}</button>
        <button className="mid-p-tag">{props.item.job_mode}</button>
        <button className="mid-p-tag">{props.item.job_type}</button>
      </div>
      <br />
      <hr />
      <br />
      <div className="bottom">
        <p className="mid-p-tag">{props.item.application_status}</p>
        <p className="bottom-p-tag">
          Posted {calculateTimeAgo(props.item.created_at)}
        </p>
      </div>
    </div>
  );
  s;
};

export default JobCard;
