import DisplayProfile from './DisplayProfile.jsx';

export default function Navbar(props)  {
  const LoginAndSignUpBtn = () => {
    return (
      <>
        <div className="p-2">
          <button className="btn btn-success" type="button" onClick={() => window.location.href = "/login"}>login</button>  
        </div>
        <div className="p-2">
          <button className="btn btn-outline-danger" type="button" onClick={() => window.location.href = "/signin"}>signup</button>
        </div>
      </>
    );
  }
  return (
    <nav className="navbar navbar-expand-lg bg-body-tertiary" data-bs-theme="dark" style={{boxShadow: '0 0 .8em .1em'}}>
      <div className="container-fluid" id="navbarSupportedContent">
        <a className="navbar-brand" href="/">LinkTree</a>
        <ul className="navbar-nav me-auto mb-2 mb-lg-0">
          <li className="nav-item">
            <a className="nav-link" href="/">home</a>  
          </li>
          <li className="nav-item">
            <a className="nav-link" href="/templates">templates</a>
          </li>
          <li className="nav-item">
            <a className="nav-link" href="/" onClick={() => {
              window.location.href = "/";
              window.scrollTo(0,350);
            }}>why?</a>
          </li>
          <li className="nav-item">
            <form className="d-flex" role="search">
              <input className="form-control me-2" type="search" placeholder="Search a Linktree..." />
              <button className="btn btn-outline-primary" type="submit">Search</button>
            </form>
          </li>
        </ul>
      </div> 
      <div className="d-flex flex-row p-2">
        {(props.profileDisplay === null)? <LoginAndSignUpBtn />: <DisplayProfile profilePic={props.profileDisplay} /> }
      </div>
    </nav>
  );
}

