import {useState} from 'react';

export default function DisplayProfile({profilepic})  {
  const [dropDownOpen, setDropDown] = useState(false);
  return (
    <div className="btn-group" onClick={() => setDropDown(!dropDownOpen)}>
      <img src={profilepic ?? "/profile-pic.png"} height="45" style={{borderRadius: '50%'}} 
        className="btn btn-secondary dropdown-toggle" />
      <ul className={dropDownOpen? "dropdown-menu show":"dropdown-menu" } id="drop-down-profile-icon">
        <a className="dropdown-item" href="/profile">view profile</a>
        <a className="dropdown-item" onClick={() => {
          document.cookie = "";
          window.location.reload();
        }}>Logout</a>
      </ul>  
    </div>
  );
}
