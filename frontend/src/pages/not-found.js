import React from "react";

const NotFound = () => {
  return (
    <div>
      <header className="header">
        <img src="/logo.png" alt="UPLB CAS-OCS logo" id="header-logo" />
        <span className="header-text">
          {" "}
          CAS Office of the College Secretary
        </span>
      </header>
      <div className="home-body" id="#not-found-page">
        <h1 id="h1-not-found">404</h1>
        <p id="not-found-details">This page does not exist.</p>
        <p>
          <a href="/" id="return">
            Return to Home
          </a>
        </p>
      </div>
    </div>
  );
};

export default NotFound;
