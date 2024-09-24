import { useNavigate } from 'react-router-dom';
import './navbar.css';

const Navbar = props => {
  // console.log(props);
  // console.log(import.meta.env.serverUrl);

  const navigate = useNavigate();

  const onLogOut = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/login');
  };
  return (
    <div className="navbar">
      <h1>Kerala Business Network</h1>
      {/* <h1>Kareer Bridge Network</h1> */}
      <div className="images">
        <img className="type1" src="/images/Group.png" />
        <img
          className="type2"
          src={
            props.image
              ? `http://localhost:8000${props.image}`
              : `/images/Group2.png`
          }
        />
        <img onClick={onLogOut} className="type1" src="/images/Group 69.png" />
      </div>
    </div>
  );
};

export default Navbar;
