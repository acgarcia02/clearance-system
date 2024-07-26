import React, { useState, useEffect } from "react";
import * as FaIcons from "react-icons/fa";
import CoordPopup from "../components/add-coord";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const CoordinatorsPage = () => {
  const backendUrl = process.env.REACT_APP_BACKEND_URL;
  const [coordinators, setCoordinators] = useState([]);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [selectedCoord, setSelectedCoord] = useState(null);

  const unitNames = [
    "Institute of Biological Sciences",
    "Institute of Chemistry",
    "Institute of Computer Science",
    "Institute of Mathematical Sciences and Physics",
    "Institute of Statistics",
    "Department of Humanities",
    "Department of Social Sciences",
    "Department of Human Kinetics",
    "Office of the College Secretary",
  ];

  const editCoordinator = async (c) => {
    setSelectedCoord(c);
    setIsPopupOpen(!isPopupOpen);
  };

  const getCoordinators = async () => {
    try {
      const response = await fetch(`${backendUrl}/staff/coordinators`, {
        method: "GET",
      });
      const body = await response.json();
      setCoordinators(body);
    } catch (error) {
      toast.error("Error fetching coordinators", {
        autoClose: 5000,
        closeButton: true,
      });
    }
  };

  const handleAction = (c) => {
    if (selectedCoord) {
      setCoordinators((prev) =>
        prev.map((coordinator) => (coordinator._id === c._id ? c : coordinator))
      );
      setSelectedCoord(null);
    } else {
      setCoordinators((prev) => [...prev, c]);
    }
  };

  const handleDelete = async (c) => {
    const originalCoordinators = [...coordinators];
    setCoordinators(
      coordinators.filter((coordinator) => coordinator._id !== c._id)
    );
    const toastId = toast.loading("Deleting coordinator...");

    try {
      const response = await fetch(`${backendUrl}/staff/coordinators`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(c),
      });
      const body = await response.json();
      if (!body.success) {
        throw new Error("Delete failed");
      }
      toast.update(toastId, {
        render: "Coordinator deleted successfully",
        type: "success",
        isLoading: false,
        autoClose: 5000,
        closeButton: true,
      });
    } catch (error) {
      toast.update(toastId, {
        render: "Error deleting coordinator",
        type: "error",
        isLoading: false,
        autoClose: 5000,
        closeButton: true,
      });
      setCoordinators(originalCoordinators);
    }
  };

  useEffect(() => {
    getCoordinators();
  }, []);

  return (
    <div className="home-body">
      <main className="records-main">
        <div className="records-header">
          <h2>Coordinators</h2>
          <button id="add-bttn" onClick={() => setIsPopupOpen(!isPopupOpen)}>
            <FaIcons.FaPlus id="plus" /> Add coordinator
          </button>
        </div>
        <table className="coord-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>College Unit</th>
              <th>Role</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody className="records-tbody">
            {coordinators.length !== 0 ? (
              coordinators.map((c, index) => (
                <tr key={index}>
                  <td data-label="name">{c.displayName}</td>
                  <td data-label="email">{c.email}</td>
                  <td data-label="unit">{unitNames[c.unit]}</td>
                  <td data-label="role">{c.role}</td>
                  <td data-label="action">
                    <button id="edit" onClick={() => editCoordinator(c)}>
                      <FaIcons.FaEdit />
                    </button>
                    <button id="delete" onClick={() => handleDelete(c)}>
                      <FaIcons.FaTrash />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5">No coordinators found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </main>
      <CoordPopup
        isOpen={isPopupOpen}
        onClose={() => setIsPopupOpen(false)}
        onAction={handleAction}
        coordinator={selectedCoord}
      />
      <ToastContainer position="bottom-right" />
    </div>
  );
};

export default CoordinatorsPage;
