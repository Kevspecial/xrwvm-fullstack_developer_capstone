import React, { useState } from "react";
import "./Register.css";
import user_icon from "../assets/person.png"
import email_icon from "../assets/email.png"
import password_icon from "../assets/password.png"
import close_icon from "../assets/close.png"

const Register = () => {

  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setlastName] = useState("");


  const gohome = ()=> {
    window.location.href = window.location.origin;
  }

  const register = async (e) => {
    e.preventDefault();

    let register_url = window.location.origin+"/djangoapp/register";
    
    const res = await fetch(register_url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            "userName": userName,
            "password": password,
            "firstName":firstName,
            "lastName":lastName,
            "email":email
        }),
    });

    const json = await res.json();
    if (json.status) {
        sessionStorage.setItem('username', json.userName);
        window.location.href = window.location.origin;
    }
    else if (json.error === "Already Registered") {
      alert("The user with same username is already registered");
      window.location.href = window.location.origin;
    }
};

  return(
    <div className='container container-narrow py-4'>
      <div className='card card-clean p-4 mx-auto' style={{maxWidth:'680px'}}>
        <div className='d-flex align-items-start justify-content-between'>
          <h3 className='mb-3'>Sign up</h3>
          <a href='/' onClick={()=>{gohome()}} className='btn btn-sm btn-outline-secondary'>
            Close
          </a>
        </div>

        <form onSubmit={register}>
          <div className='row g-3'>
            <div className='col-md-6'>
              <label className='form-label'>Username</label>
              <div className='input-group'>
                <span className='input-group-text'><img src={user_icon} alt='Username' className='img_icon' style={{width:'20px'}}/></span>
                <input type="text" name="username" placeholder="Username" className="form-control" onChange={(e) => setUserName(e.target.value)}/>
              </div>
            </div>
            <div className='col-md-6'>
              <label className='form-label'>Email</label>
              <div className='input-group'>
                <span className='input-group-text'><img src={email_icon} alt='Email' className='img_icon' style={{width:'20px'}}/></span>
                <input type="email" name="email" placeholder="email" className="form-control" onChange={(e) => setEmail(e.target.value)}/>
              </div>
            </div>
            <div className='col-md-6'>
              <label className='form-label'>First Name</label>
              <div className='input-group'>
                <span className='input-group-text'><img src={user_icon} alt='First Name' className='img_icon' style={{width:'20px'}}/></span>
                <input type="text" name="first_name" placeholder="First Name" className="form-control" onChange={(e) => setFirstName(e.target.value)}/>
              </div>
            </div>
            <div className='col-md-6'>
              <label className='form-label'>Last Name</label>
              <div className='input-group'>
                <span className='input-group-text'><img src={user_icon} alt='Last Name' className='img_icon' style={{width:'20px'}}/></span>
                <input type="text" name="last_name" placeholder="Last Name" className="form-control" onChange={(e) => setlastName(e.target.value)}/>
              </div>
            </div>
            <div className='col-12'>
              <label className='form-label'>Password</label>
              <div className='input-group'>
                <span className='input-group-text'><img src={password_icon} alt='Password' className='img_icon' style={{width:'20px'}}/></span>
                <input name="psw" type="password" placeholder="Password" className="form-control" onChange={(e) => setPassword(e.target.value)}/>
              </div>
            </div>
          </div>
          <div className='d-flex justify-content-end mt-4'>
            <input className='btn btn-brand text-white' type='submit' value='Register'/>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Register;