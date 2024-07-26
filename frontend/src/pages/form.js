import React, { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
} from "@mui/material";

const ClearanceForm = () => {
  const backendUrl = process.env.REACT_APP_BACKEND_URL;

  const [formData, setFormData] = useState({
    fname: "",
    lname: "",
    mname: "",
    studentno: "",
    degprog: "",
    address: "",
    mobileno: "",
    reason: "",
    adviser: "",
    gradsem: "",
    gradyear: "",
    shiftto: "",
    isUPCampus: false,
    uploadedID: "",
    visibleOptions: false,
    isNextPage: false,
  });

  const [formSubmitted, setFormSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [resubmitID, setResubmitID] = useState(false);

  const handleChange = (e) => {
    const { name, type, checked, value } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSelected = (e) => {
    const reason = e.target.value;
    setFormData({
      ...formData,
      [e.target.name]: reason,
      visibleOptions: reason !== "",
    });
  };

  const handleFileChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.files[0],
    });
  };

  const handleUpload = async (uploadedFile) => {
    const formData = new FormData();
    formData.append("file", uploadedFile);

    try {
      const response = await fetch(`${backendUrl}/image/upload`, {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      const body = await response.json();
      if (body.success) {
      } else {
        console.error("Error uploading form");
      }
    } catch (error) {
      console.error("Error uploading form:", error);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setErrorMessage("");

    const endpoint = formSubmitted
      ? `${backendUrl}/student/edit`
      : `${backendUrl}/student/submit`;
    const method = formSubmitted ? "PATCH" : "POST";

    try {
      const response = await fetch(endpoint, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
        credentials: "include",
      });
      if (!response.ok) {
        const body = await response.json();
        if (body.message) {
          toast.error(body.message);
          setTimeout(() => {
            window.location.href = "/login";
          }, 3000);
        }
        throw new Error("Error updating details");
      }
      handleUpload(formData.uploadedID);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "CAS-OCS-Form-No-016-College-Clearance.pdf";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      window.location.href = "https://cas-clearance.vercel.app";
    } catch (error) {
      console.error("Error updating details:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNext = () => {
    const requiredFields = [
      "fname",
      "lname",
      "studentno",
      "address",
      "mobileno",
    ];
    const studentNoPattern = /^\d{4}-\d{5}$/;
    if (!studentNoPattern.test(formData.studentno)) {
      setErrorMessage("Student number must be in the format XXXX-XXXXX.");
      setIsSubmitting(false);
      return;
    }
    if (requiredFields.some((field) => !formData[field])) {
      setErrorMessage("Please fill out all required fields");
    } else {
      setErrorMessage("");
      setFormData({ ...formData, isNextPage: !formData.isNextPage });
    }
  };

  const showOptions = () => {
    switch (formData.reason) {
      case "Graduating":
        return (
          <div className="option-container">
            <label htmlFor="gradsem">Semester: </label>
            <select
              id="gradsem"
              name="gradsem"
              form="clearance-form"
              value={formData.gradsem}
              onChange={handleChange}
              required
            >
              <option value="" disabled>
                Select semester
              </option>
              <option value="1st Semester">1st Semester</option>
              <option value="2nd Semester">2nd Semester</option>
              <option value="Midyear">Midyear</option>
            </select>
            <label htmlFor="gradyear">Academic Year: </label>
            <input
              type="text"
              name="gradyear"
              id="gradyear"
              value={formData.gradyear}
              onChange={handleChange}
              placeholder="2023-2024"
              required
            />
          </div>
        );
      case "Transferring":
        return (
          <div className="option-container">
            <label htmlFor="isUPCampus">
              Are you transferring to a UP constituent university?
            </label>
            <div className="check-box-options">
              <input
                type="checkbox"
                name="isUPCampus"
                id="isUPCampus"
                checked={formData.isUPCampus}
                onChange={handleChange}
              />
              <span>Yes</span>
            </div>
            <label htmlFor="shiftto">Transferring to: </label>
            <input
              type="text"
              name="shiftto"
              id="shiftto"
              value={formData.shiftto}
              onChange={handleChange}
              placeholder="Please specify University"
              required
            />
          </div>
        );
      case "Others":
        return (
          <div className="option-container">
            <label htmlFor="others">Please specify: </label>
            <input
              type="text"
              name="others"
              id="others"
              placeholder="Please specify"
              required
            />
          </div>
        );
      default:
        return null;
    }
  };

  useEffect(() => {
    const getProfile = async () => {
      try {
        const response = await fetch(`${backendUrl}/student/profile`, {
          method: "GET",
          credentials: "include",
        });
        const body = await response.json();
        if (body.success) {
          const { student, ...request } = body.request;
          setFormData({
            fname: student.studentDetails.firstName,
            lname: student.studentDetails.lastName,
            mname: student.studentDetails.middleName,
            studentno: student.studentDetails.studentNumber,
            degprog: student.studentDetails.degreeProgram,
            address: student.studentDetails.address,
            mobileno: student.studentDetails.contact,
            reason: request.reason,
            adviser: student.studentDetails.adviser,
            gradsem: request.semester,
            gradyear: request.acadYear,
            shiftto: request.shiftTo,
            isUPCampus: request.isUPCampus,
            uploadedID: student.studentDetails.uploadedID,
          });
          if (request.file) {
            setFormSubmitted(true);
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    if (!formSubmitted) {
      getProfile();
    }
  }, [formSubmitted]);

  const handleDialogOpen = () => {
    const requiredFields = ["degprog", "adviser", "reason", "uploadedID"];

    if (requiredFields.some((field) => !formData[field])) {
      setErrorMessage("Please fill out all required fields");
      setIsSubmitting(false);
      return;
    }

    if (formData.reason === "Graduating") {
      if (!formData.gradsem || !formData.gradyear) {
        setErrorMessage(
          "Graduating students must fill out Semester and Year Graduating."
        );
        setIsSubmitting(false);
        return;
      }
    } else if (formData.reason === "Transferring") {
      if (!formData.shiftto) {
        setErrorMessage("Transferring students must fill out Transferring to.");
        setIsSubmitting(false);
        return;
      }
    }

    setOpenDialog(true);
  };

  const handleDialogClose = (confirmed) => {
    setOpenDialog(false);
    if (confirmed) {
      handleSubmit();
    }
  };

  return (
    <div className="form-page">
      {isSubmitting && (
        <div className="popup-overlay open">
          <div className="loader-wrapper" id="fp-loader">
            <div className="loader"></div>
          </div>
        </div>
      )}
      <div className="form-container">
        <h2>College Clearance Form</h2>
        <form className="clearance-form" onSubmit={(e) => e.preventDefault()}>
          {!formData.isNextPage ? (
            <>
              <p>Please fill out your personal information.</p>
              <label htmlFor="lname">Last Name: </label>
              <input
                type="text"
                name="lname"
                id="lname"
                value={formData.lname}
                onChange={handleChange}
                placeholder="Dela Cruz"
                required
              />
              <label htmlFor="fname">First Name: </label>
              <input
                type="text"
                name="fname"
                id="fname"
                value={formData.fname}
                onChange={handleChange}
                placeholder="Juan"
                required
              />
              <label htmlFor="mname">Middle Name: </label>
              <input
                type="text"
                name="mname"
                id="mname"
                value={formData.mname}
                onChange={handleChange}
                placeholder="Santos"
              />
              <label htmlFor="studentno">Student Number: </label>
              <input
                type="text"
                name="studentno"
                id="studentno"
                value={formData.studentno}
                onChange={handleChange}
                placeholder="2020-00000"
                required
              />
              <label htmlFor="address">College Address: </label>
              <input
                type="text"
                name="address"
                id="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Brgy. Batong Malake, Los Baños, Laguna"
                required
              />
              <label htmlFor="mobileno">Mobile number: </label>
              <input
                type="text"
                name="mobileno"
                id="mobileno"
                value={formData.mobileno}
                onChange={handleChange}
                placeholder="09123456789"
                required
              />
              {errorMessage && <p className="error-message">{errorMessage}</p>}
              <button id="next-button" type="button" onClick={handleNext}>
                Next
              </button>
            </>
          ) : (
            <>
              <p>Please fill out the details for your clearance request.</p>
              <label htmlFor="degprog">Degree Program: </label>
              <select
                id="degprog"
                name="degprog"
                form="clearance-form"
                required
                value={formData.degprog}
                onChange={handleChange}
              >
                <option value="" disabled>
                  Select degree program
                </option>
                <option value="BA Communication Arts">
                  BA Communication Arts
                </option>
                <option value="BA Sociology">BA Sociology</option>
                <option value="BA Philosophy">BA Philosophy</option>
                <option value="BS Applied Mathematics">
                  BS Applied Mathematics
                </option>
                <option value="BS Applied Physics">BS Applied Physics</option>
                <option value="BS Biology">BS Biology</option>
                <option value="BS Chemistry">BS Chemistry</option>
                <option value="BS Computer Science">BS Computer Science</option>
                <option value="BS Mathematics">BS Mathematics</option>
                <option value="BS Mathematics and Science Teaching">
                  BS Mathematics and Science Teaching
                </option>
                <option value="BS Statistics">BS Statistics</option>
              </select>
              <label htmlFor="adviser">Academic/Major Adviser: </label>
              <input
                type="text"
                name="adviser"
                id="adviser"
                value={formData.adviser}
                onChange={handleChange}
                required
              />
              <label htmlFor="reason">Reason for clearance: </label>
              <select
                id="reason"
                name="reason"
                form="clearance-form"
                required
                value={formData.reason}
                onChange={handleSelected}
              >
                <option value="" disabled>
                  Select reason
                </option>
                <option value="Graduating">Graduating</option>
                <option value="Transferring">Transferring</option>
              </select>
              {formData.visibleOptions && showOptions()}

              {formData.uploadedID && formSubmitted ? (
                <div className="check-box-options">
                  <label htmlFor="resubmit-id">
                    Need to resubmit ID?
                    <input
                      type="checkbox"
                      name="resubmitID"
                      id="resubmit-id"
                      checked={resubmitID}
                      onChange={() => setResubmitID(!resubmitID)}
                    />
                  </label>
                </div>
              ) : (
                <div style={{ display: "none" }}></div>
              )}

              {(!formSubmitted || resubmitID) && (
                <>
                  <label htmlFor="uploadedID">
                    Upload UP ID or any valid ID (in .jpg):
                  </label>
                  <input
                    type="file"
                    accept="image/jpeg"
                    name="uploadedID"
                    id="uploadedID"
                    onChange={handleFileChange}
                    required={!formData.uploadedID || resubmitID}
                  />
                </>
              )}

              {errorMessage && <p className="error-message">{errorMessage}</p>}

              <button
                id="back-button"
                type="button"
                onClick={handleNext}
                disabled={isSubmitting}
              >
                Back
              </button>
              <button
                id="submit-button"
                type="button"
                onClick={handleDialogOpen}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Processing..." : "Submit"}
              </button>
            </>
          )}
        </form>
      </div>
      <div className="banner" id="form-banner"></div>
      <ToastContainer />
      <Dialog
        open={openDialog}
        onClose={() => handleDialogClose(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {"Confirm Submission"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Please review your information carefully. Once you submit, your
            application will be downloaded immediately.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => handleDialogClose(false)} color="primary">
            Cancel
          </Button>
          <Button
            onClick={() => handleDialogClose(true)}
            color="primary"
            autoFocus
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default ClearanceForm;
