import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import * as FaIcons from "react-icons/fa";
import { AdminMenuOptions } from "./admin-menu";
import { CoordinatorMenuOptions } from "./coord-menu";
import { StudentMenuOptions } from "./student-menu";

const Navbar = () => {
  const backendUrl = process.env.REACT_APP_BACKEND_URL;
  const [menuOptions, setMenuOptions] = useState([]);
  const location = useLocation();

  const logOut = async () => {
    try {
      const response = await fetch(`${backendUrl}/auth/google/signout`, {
        method: "GET",
        credentials: "include",
      });
      const body = await response.json();
      console.log(body.success);
      if (body.success) {
        window.location.href = "https://cas-clearance.vercel.app/login";
      } else {
        console.log("Logout failed");
      }
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  useEffect(() => {
    const getUser = async () => {
      try {
        const response = await fetch(`${backendUrl}/staff/user`, {
          method: "GET",
          credentials: "include",
        });
        const body = await response.json();
        if (body) {
          switch (body.role) {
            case "admin":
              setMenuOptions(AdminMenuOptions);
              break;
            case "coordinator":
              setMenuOptions(CoordinatorMenuOptions);
              break;
            default:
              setMenuOptions(StudentMenuOptions(body.file));
          }
        }
      } catch (error) {
        console.error("Error fetching department:", error);
      }
    };
    getUser();
  }, []);

  return (
    <>
      <nav className="main-menu">
        <ul>
          {menuOptions.map((option, index) => (
            <li key={index}>
              <Link
                to={option.path}
                className={`nav-container ${
                  location.pathname === option.path ? "active" : ""
                }`}
              >
                <i className="nav-icon">{option.icon}</i>
                <span className="nav-text">{option.label}</span>
              </Link>
            </li>
          ))}
          <li className="logout" onClick={logOut}>
            <i className="nav-icon">
              <FaIcons.FaSignOutAlt />
            </i>
            <span className="nav-text">Log out</span>
          </li>
        </ul>
      </nav>
    </>
  );
};

export default Navbar;
