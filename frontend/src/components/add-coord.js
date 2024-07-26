import React, { useEffect, useState } from "react";
import * as FaIcons from "react-icons/fa";
import unitNames from "../components/constants";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const CoordPopup = ({ isOpen, onClose, onAction, coordinator }) => {
  const backendUrl = process.env.REACT_APP_BACKEND_URL;
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    unit: "",
    role: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSelected = (e) => {
    const reason = e.target.value;
    setFormData({ ...formData, [e.target.name]: reason });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const addCoordinator = async () => {
    setIsSubmitting(true);
    const toastId = toast.loading("Adding coordinator...");
    try {
      const response = await fetch(`${backendUrl}/staff/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const body = await response.json();
      if (body) {
        onAction(body);
        toast.update(toastId, {
          render: "Coordinator added successfully",
          type: "success",
          isLoading: false,
          autoClose: 5000,
          closeButton: true,
        });
        closePopup();
      }
    } catch (error) {
      console.error("Error adding coordinator:", error);
      toast.update(toastId, {
        render: "Error adding coordinator",
        type: "error",
        isLoading: false,
        autoClose: 5000,
        closeButton: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const editCoordinator = async () => {
    setIsSubmitting(true);
    const toastId = toast.loading("Editing coordinator...");
    try {
      const response = await fetch(`${backendUrl}/staff/coordinators`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const body = await response.json();
      if (body) {
        onAction(body);
        toast.update(toastId, {
          render: "Coordinator edited successfully",
          type: "success",
          isLoading: false,
          autoClose: 5000,
          closeButton: true,
        });
        onClose();
      }
    } catch (error) {
      console.error("Error editing coordinator:", error);
      toast.update(toastId, {
        render: "Error editing coordinator",
        type: "error",
        isLoading: false,
        autoClose: 5000,
        closeButton: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.unit || !formData.role) {
      setErrorMessage("All fields are required.");
      return;
    }

    setErrorMessage("");

    if (coordinator) {
      await editCoordinator();
    } else {
      await addCoordinator();
    }

    onClose();
  };

  const closePopup = () => {
    setFormData({
      name: "",
      email: "",
      unit: "",
      role: "",
    });
    setErrorMessage("");
    onClose();
  };

  useEffect(() => {
    if (coordinator) {
      setFormData({
        id: coordinator._id || "",
        name: coordinator.displayName || "",
        email: coordinator.email || "",
        unit: coordinator.unit || "",
        role: coordinator.role || "",
      });
    } else {
      setFormData({
        name: "",
        email: "",
        unit: "",
        role: "",
      });
    }
  }, [coordinator]);

  return (
    <div className={`popup-overlay ${isOpen ? "open" : ""}`}>
      <div className="popup-container">
        <button className="close-button" onClick={closePopup}>
          <FaIcons.FaTimes />
        </button>
        <h3>
          <FaIcons.FaUserFriends /> Add Coordinator
        </h3>
        <div className="wh-container">
          <form className="coordinator-form" onSubmit={handleSubmit}>
            <label htmlFor="name">Name: </label>
            <input
              type="text"
              name="name"
              id="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Juan Dela Cruz"
              required
              disabled={isSubmitting}
            />
            <label htmlFor="email">Email: </label>
            <input
              type="email"
              name="email"
              id="email"
              pattern="[a-zA-Z0-9._%+-]+@up\\.edu\\.ph]"
              value={formData.email || ""}
              onChange={handleChange}
              placeholder="aa@up.edu.ph"
              required
              disabled={isSubmitting}
            />
            <label htmlFor="unit">College unit: </label>
            <select
              id="unit"
              name="unit"
              form="coordinator-form"
              required
              value={formData.unit}
              onChange={handleSelected}
              disabled={isSubmitting}
            >
              <option value="" disabled>
                Select unit
              </option>
              {unitNames.map((unit, index) => (
                <option key={index} value={index}>
                  {unit}
                </option>
              ))}
            </select>
            <label htmlFor="role">Role: </label>
            <select
              id="role"
              name="role"
              form="clearance-form"
              required
              value={formData.role}
              onChange={handleSelected}
              disabled={isSubmitting}
            >
              <option value="" disabled>
                Select role
              </option>
              <option value="admin">Admin</option>
              <option value="coordinator">Coordinator</option>
            </select>
            {errorMessage && <p className="error-message">{errorMessage}</p>}
            <div className="popup-button-container">
              <button
                className="popup-button"
                type="submit"
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Submitting..." : "Confirm"}
              </button>
            </div>
          </form>
        </div>
      </div>
      <ToastContainer position="bottom-right" />
    </div>
  );
};

export default CoordPopup;
