import React from "react";
const backendUrl = process.env.REACT_APP_BACKEND_URL;

const Login = () => {
  const login = () => {
    window.location.href = `${backendUrl}/auth/google/callback`;
  };

  return (
    <div className="login-container">
      <div className="banner" id="login-banner"></div>
      <div className="right-container">
        <div className="logo-container">
          <img src="/logo.png" alt="UPLB CAS-OCS logo" id="logo" />
          <h3>COLLEGE OF ARTS AND SCIENCES</h3>
          <h3>OFFICE OF THE COLLEGE SECRETARY</h3>
          <h3>CLEARANCE SYSTEM</h3>
        </div>
        <div className="login-buttons">
          <h2>Log in to your account</h2>
          <button id="button-students" onClick={login}>
            Sign in using your up.edu.ph or Gmail account
          </button>
          <div className="login-notes">
            <p>
              This application is designed for students of the College of Arts
              and Sciences to process their clearance. For any issues or
              concerns, please contact clearance.cas.ocs@gmail.com.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
