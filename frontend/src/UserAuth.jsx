import {useState,useEffect} from 'react';

const AUTH_STATUS = Object.freeze({
  INACTIVE: 0x0,
  RUNNING: 0x1f,
  FAILED: 0x2f,
  SUCCESS: 0x3f
});

export function SignUp()  {
  const [userdata, setUserData] = useState({username: '', email: '', password: '', bio: ''});
  const [typepassword, setType] = useState("password");
  const [signUpStatus, setSignUpStatus] = useState(AUTH_STATUS.INACTIVE);
  async function signUpHandler(evt)  {
    evt.preventDefault();
    setSignUpStatus(AUTH_STATUS.RUNNING);
    try {
      if (userdata.username === '' || userdata.email === '' || userdata.password === '' || userdata.bio === null) {
        window.alert("All fields must be filled!");
        return;
      }
      const response = await fetch("http://127.0.0.1:8000/api/signin", {
        method: 'POST',headers: {'Content-Type': 'application/json','Access-Control-Allow-Origin': '*'},
        body: JSON.stringify(userdata)
      });
      if (!response.ok)  {
        if (response.status === 401) 
          setSignUpFailed(AUTH_STATUS.FAILED);
      }
      setSignUpStatus(AUTH_STATUS.SUCCESS);
      const response_body = await response.json();
      document.cookie = `__session=${response_body.token};`;
      setTimeout(() => {
        window.location.href = "/";
      }, 1200);
    } 
    catch (e)  {
      window.location.href = "/note";   // if server is down!
    } 
  }
  useEffect(() => {
    if (signUpStatus === AUTH_STATUS.FAILED) 
      window.alert("Failed to signin, invalid email or password!");
  }, [signUpStatus,userdata]);
  return (
    <form onSubmit={signUpHandler} method="">
      <div className="form-group">
        <label htmlFor="userName">username</label>
        <input type="text" id="userName" onChange={(evt) => {
          const copied = {...userdata};
          setUserData({
            username: evt.target.value,email: copied.email,
            password: copied.password,bio: copied.bio
          }); 
        }} placeholder="enter username..." className="form-control" required/>
      </div>
      <div className="form-group">
        <label htmlFor="exampleInputEmail">email</label>
        <input type="email" id="exampleInputEmail" placeholder="enter your email..." className="form-control" 
         onChange={(evt) => {
           const copied = {...userdata};
           setUserData({
             email: evt.target.value, username: copied.username,
             password: copied.password, bio: copied.bio
           });
         }} required/>
      </div>
      <div className="form-group">
        <label htmlFor="inputPassword">password</label>
        <input type={typepassword} id="inputPassword" placeholder="enter password.." className="form-control" 
          onChange={(evt) => {
            const copied = {...userdata};
            setUserData({
              password: evt.target.value, email: copied.email,
              username: copied.username, bio: copied.bio
            });
          }} required />
      </div>
      <div className="form-group">
        <label htmlFor="userBio">enter bio</label>
        <textarea maxLength="100" className="form-control" style={{resize: "none"}} placeholder="enter bio..." rows="3" id="userBio"
        onChange={(evt) => {
          const copied = {...userdata};
          setUserData({
            bio: evt.target.value, email: copied.email,
            username: copied.username, password: copied.password
          });    
        }}></textarea>
      </div>
      <div className="form-group form-check">
        <input type="checkbox" className="form-check-input" 
           onChange={(evt) => setType(evt.target.checked? "text":"password")} id="showPasswordCheckBox" />
        <label className="form-check-label" htmlFor="showPasswordCheckBox">show password</label>
      </div>
      <p>Already have an account? <a href="/login">login</a></p>
      <button type="submit" className="btn btn-primary">
        {(signUpStatus === AUTH_STATUS.RUNNING)? 
        (<div className="spinner-border text-light" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>): 'sign in'}
      </button>
    </form>
  );
}

export function Login()  {
  const [userdata, setUserData] = useState({email: '', password: ''});
  const [inputBoxType, setInputBoxType] = useState(true);
  async function loginHandler(evt)  {
    evt.preventDefault();
    if (userdata.email === '' || userdata.password === '')
      return;
    try {
      const login = await fetch("http://127.0.0.1:8000/api/loginuser", {
        method: 'POST', headers: {'Content-Type': 'application/json','Access-Control-Allow-Origin': '*'},
        body: JSON.stringify(userdata)
      });
      if (!login.ok)  {
        window.alert("Your either not signed-in or password is invalid, try again!");
        return;
      }
      const response_body = await login.json();
      document.cookie = `__session=${response_body.token}`;
      setTimeout(() => {
        window.location.href = "/";
      }, 1200);      
    } catch(e)  {
      window.location.href = "/note";
    } 
  }
  return (
    <form onSubmit={loginHandler} method="">
      <div className="form-group">
        <label htmlFor="exampleInputEmail">email</label>
        <input type="text" id="exampleInputEmail" placeholder="enter your email..." 
        className="form-control" required={true} onChange={(evt) => {
          const copied = Object.assign({}, userdata);
          setUserData({email: evt.target.value, password: copied.password});
        }}/>
      </div>
      <div className="form-group">
        <label htmlFor="inputPassword">password</label>
        <input type={inputBoxType? "password":"text"} id="inputPassword" placeholder="enter password.." 
          className="form-control" required={true} onChange={(evt) => {
            const copied = Object.assign({}, userdata);
            setUserData({email: copied.email, password: evt.target.value})
          }} />
      </div>
      <div className="form-group form-check">
        <input type="checkbox" className="form-check-input" id="showPasswordCheckBox"
          onChange={() => setInputBoxType(!inputBoxType)} />
        <label className="form-check-label" htmlFor="showPasswordCheckBox">show password</label>
      </div>
      <p>Don't have an account? <a href="/signup">signup</a></p>
      <button type="submit" className="btn btn-primary">Submit</button>
    </form>
  );
}

