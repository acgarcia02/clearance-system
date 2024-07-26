import { useState, useEffect } from "react";
import Navbar from "./navbar";

const PrivateRoute = ({ Component, allowedRoles, hasNavbar }) => {
  const backendUrl = process.env.REACT_APP_BACKEND_URL;

  const [isLoggedin, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const getUser = async () => {
      try {
        const response = await fetch(`${backendUrl}/auth/google/loggedin`, {
          method: "GET",
          credentials: "include",
        });
        const body = await response.json();
        if (body.success) {
          setUser(body.user);
          setIsLoggedIn(true);
        }
      } catch (error) {
        console.error("Error fetching authentication status:", error);
      } finally {
        setIsLoading(false);
      }
    };

    getUser();
  }, []);

  if (isLoading) {
    return (
      <div className="loader-wrapper" id="fp-loader">
        <div className="loader"></div>
      </div>
    );
  }

  if (isLoggedin) {
    if (allowedRoles.includes(user.role)) {
      if (hasNavbar) {
        return (
          <>
            <header className="header">
              <img src="/logo.png" alt="UPLB CAS-OCS logo" id="header-logo" />
              <span className="header-text">
                {" "}
                UPLB-CAS OCS College Clearance System
              </span>
            </header>
            <Navbar />
            <Component />
          </>
        );
      } else {
        return <Component />;
      }
    } else {
      window.location.href = "https://cas-clearance.vercel.app/";
    }
  } else {
    window.location.href = "https://cas-clearance.vercel.app/login";
  }
};

export default PrivateRoute;
