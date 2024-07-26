import React, { useEffect, useState } from "react";
import StudentHomepage from "./student-home";
import CoordinatorHomepage from "./coord-home";
import AdminHomepage from "./admin-home";

const Home = () => {
  const backendUrl = process.env.REACT_APP_BACKEND_URL;

  const [role, setRole] = useState(null);

  useEffect(() => {
    const getUser = async () => {
      try {
        const response = await fetch(`${backendUrl}/auth/google/loggedin`, {
          method: "GET",
          credentials: "include",
        });
        const body = await response.json();
        if (body.success) {
          setRole(body.user.role);
        }
      } catch (error) {
        console.error("Error fetching authentication status:", error);
      }
    };
    getUser();
  }, []);

  return (
    <div>
      {role === "student" && <StudentHomepage />}
      {role === "coordinator" && <CoordinatorHomepage />}
      {role === "admin" && <AdminHomepage />}
    </div>
  );
};

export default Home;
