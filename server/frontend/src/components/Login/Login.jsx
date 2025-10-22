import React, { useState } from 'react';

import "./Login.css";
import Header from '../Header/Header';

const Login = ({ onClose }) => {

  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [open,setOpen] = useState(true)

  let login_url = window.location.origin+"/djangoapp/login";

  const login = async (e) => {
    e.preventDefault();

    const res = await fetch(login_url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            "userName": userName,
            "password": password
        }),
    });
    
    const json = await res.json();
    if (json.status != null && json.status === "Authenticated") {
        sessionStorage.setItem('username', json.userName);
        setOpen(false);        
    }
    else {
      alert("The user could not be authenticated.")
    }
};

  if (!open) {
    window.location.href = "/";
  };
  

  return (
    <div>
      <Header/>
      <div className='container container-narrow py-4'>
        <div className='card card-clean p-4 mx-auto' style={{maxWidth:'520px'}}>
          <h3 className='mb-3'>Sign in</h3>
          <form onSubmit={login}>
            <div className='mb-3'>
              <label className='form-label'>Username</label>
              <input type="text" name="username" placeholder="Username" className="form-control" onChange={(e) => setUserName(e.target.value)} />
            </div>
            <div className='mb-3'>
              <label className='form-label'>Password</label>
              <input name="psw" type="password" placeholder="Password" className="form-control" onChange={(e) => setPassword(e.target.value)} />
            </div>
            <div className='d-flex align-items-center justify-content-between'>
              <button className='btn btn-brand text-white' type='submit'>Login</button>
              <button className='btn btn-outline-secondary' type='button' onClick={()=>setOpen(false)}>Cancel</button>
            </div>
          </form>
          <div className='mt-3'>
            <a className="text-decoration-none" href="/register">Register Now</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
