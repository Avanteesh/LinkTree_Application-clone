import { StrictMode, useEffect,useState} from 'react';
import {BrowserRouter, Routes, Route} from 'react-router-dom';
import {SignUp, Login} from './UserAuth.jsx';
import { createRoot } from 'react-dom/client';
import Error404Note from './Error404.jsx';
import Profile from './Profile.jsx';
import Navbar from './Navbar.jsx';
import Templates from './Templates.jsx';
import {HeaderFooter, WhyLinkTree,BottomSection,AnalyzeBanner} from './HomeFooter.jsx';
import 'bootstrap/dist/css/bootstrap.css';
import './stylesheets/home.css';

function Home(props)  {
  useEffect(() => {
    document.querySelector("#root").className = (props.home === true)? "normal":"colored-background";
  }, []);
  if (props.home === true)  {
    return (
      <>
        {(props.profile === null)?(<Navbar profileDisplay={props.profile}/>):(<Navbar profileDisplay={props.profile}/>)}
        <HeaderFooter />
        <WhyLinkTree />
        <AnalyzeBanner />
        <BottomSection />
      </> 
    );
  }
  return (
    <>
      {(props.profile === null)?(<Navbar profileDisplay={props.profile}/>):(<Navbar profileDisplay={props.profile} />)}
      <Templates />
    </>
  );
}

// forms for handling login and signup!
function AuthUser(props) {
  return (
    <div style={{display:'grid',placeItems:'center',width:'100%',height:'100vh'}}>
      {props.child}  
    </div>
  );
}

function App()  {
  const [userData, setUserData] = useState(null);
  async function getUserData(token)  {
    const fetched_user = await fetch(`http://127.0.0.1:8000/api/user?token=${token}`).then(
      (res) => { return res.json(); }
    );
    if (fetched_user.status === 'success') 
      return fetched_user.data;
    return null;
  }
  useEffect(() => {
    if (document.cookie != "")  {
      if (userData === null)  {
        const cookie_token = document.cookie.split(";").map((item) => {
          return item.split("=");
        });
        const result = getUserData(cookie_token[0][1]);
        setUserData(result);
      }
    } else {
      setUserData(null);
    }
    return () => { return; }
  },[userData]);
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home home={true} profile={userData}/>} />
        <Route path="/templates" element={<Home home={false} profile={userData}/>} />
        <Route path="/login" element={<AuthUser child={<Login />} />} />
        <Route path="/signin" element={<AuthUser child={<SignUp />} />} />
        <Route path="/note" element={<Error404Note />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>  
    </BrowserRouter>
  );
}

createRoot(document.querySelector('#root')).render(
  <StrictMode>
    <App />
  </StrictMode>
)
