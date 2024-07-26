import React, { useState } from "react";
import * as FaIcons from "react-icons/fa";
import { format } from "date-fns";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
} from "@mui/material";

const StudentProfile = ({ isOpen, onClose, onDelete, request, unit }) => {
  const [openDialog, setOpenDialog] = useState(false);

  const renderProfilePhoto = () => {
    if (request?.student.image) {
      return (
        <img
          src={request?.student.image}
          alt="User profile"
          className="profile-pic"
          onError={(e) =>
            (e.target.src =
              "https://www.ssrl-uark.com/wp-content/uploads/2014/06/no-profile-image.png")
          }
        />
      );
    } else {
      return (
        <img
          src="https://www.ssrl-uark.com/wp-content/uploads/2014/06/no-profile-image.png"
          alt="No profile"
        />
      );
    }
  };

  const renderDateCreated = () => {
    const dateCreated = request?.dateCreated;
    if (dateCreated) {
      const date = new Date(dateCreated);
      if (!isNaN(date.getTime())) {
        return format(date, "dd MMM yyyy");
      }
    }
    return "N/A";
  };

  const renderStatus = () => {
    const unitStatus = request?.status[unit];
    switch (unitStatus?.status) {
      case "Cleared":
        return (
          <p style={{ color: "#29C927" }} className="profile-status">
            CLEARED
          </p>
        );
      case "Withheld":
        return (
          <p style={{ color: "#CF0B0B" }} className="profile-status">
            WITHHELD
          </p>
        );
      default:
        return (
          <p style={{ color: "gray" }} className="profile-status">
            PENDING
          </p>
        );
    }
  };

  const renderRequestDetails = () => {
    if (request?.reason === "Graduating") {
      return (
        <>
          <p>
            <span className="label">Semester:</span>{" "}
            <span className="value">{request?.semester}</span>
          </p>
          <p>
            <span className="label">Academic Year:</span>{" "}
            <span className="value">{request?.acadYear}</span>
          </p>
        </>
      );
    } else if (request?.reason === "Transferring") {
      return (
        <>
          <p>
            <span className="label">Transferring to a UP CU?</span>{" "}
            <span className="value">{request?.isUPCampus ? "Yes" : "No"}</span>
          </p>
          <p>
            <span className="label">Transferring to: </span>{" "}
            <span className="value">{request?.shiftTo}</span>
          </p>
        </>
      );
    }
  };

  const renderLeft = () => {
    if (unit === -1) {
      return (
        <div className="sprofile-left" id="student-sprofile">
          {renderProfilePhoto()}
          <span className="value">{request?.student.email}</span>
          <div className="admin-actions">
            <div className="view-buttons">
              <button onClick={() => handleEdit()} className="view-bttn">
                Edit clearance form
              </button>
            </div>
          </div>
        </div>
      );
    } else {
      return (
        <div className="sprofile-left">
          {renderProfilePhoto()}
          <span className="value">{request?.student.email}</span>
          <p>
            <span className="label">Status:</span>{" "}
            <span className="value">{renderStatus()}</span>
          </p>
          <p>
            <span className="label">Remarks:</span>{" "}
            <span className="value" id="profile-remarks">
              {request?.status[unit]?.remarks}
            </span>
          </p>
          {unit !== 1 && unit !== 8 && (
            <div className="admin-actions">
              <div className="view-buttons">
                <button
                  onClick={() =>
                    handleViewFile(request?.student.studentDetails.uploadedID)
                  }
                  className="view-bttn"
                >
                  View ID
                </button>
              </div>
            </div>
          )}
          {unit === 8 && (
            <div className="admin-actions">
              <div className="view-buttons">
                <button
                  onClick={() => handleViewFile(request?.file)}
                  className="view-bttn"
                >
                  View clearance form
                </button>
                <button
                  onClick={() =>
                    handleViewFile(request?.student.studentDetails.uploadedID)
                  }
                  className="view-bttn"
                >
                  View ID
                </button>
              </div>
              <button
                onClick={handleDeleteConfirmation}
                className="view-bttn"
                id="delete-bttn"
              >
                Delete request
              </button>
            </div>
          )}
        </div>
      );
    }
  };

  const handleViewFile = (file) => {
    window.open(`https://drive.google.com/file/d/${file}/view`, "_blank");
  };

  const handleDeleteConfirmation = () => {
    setOpenDialog(true);
  };

  const handleDialogClose = (confirmed) => {
    setOpenDialog(false);
    if (confirmed) {
      onDelete(request);
      onClose();
    }
  };

  const handleEdit = () => {
    window.location.href = "https://cas-clearance.vercel.app/form";
  };

  return (
    <div className={`popup-overlay ${isOpen ? "open" : ""}`}>
      <div className="popup-container" id="sprofile-container">
        <button className="close-button" onClick={onClose}>
          <FaIcons.FaTimes />
        </button>
        <h3>
          <FaIcons.FaUser className="icon" /> Student Profile
        </h3>
        <div className="sprofile-info">
          {renderLeft()}
          <div className="sprofile-right">
            <p>
              <span className="label">Name:</span>{" "}
              <span className="value">
                {request?.student.studentDetails.lastName +
                  ", " +
                  request?.student.studentDetails.firstName +
                  " " +
                  request?.student.studentDetails.middleName}
              </span>
            </p>
            <p>
              <span className="label">Student Number:</span>{" "}
              <span className="value">
                {request?.student.studentDetails.studentNumber}
              </span>
            </p>
            <p>
              <span className="label">Degree Program:</span>{" "}
              <span className="value">
                {request?.student.studentDetails.degreeProgram}
              </span>
            </p>
            <p>
              <span className="label">Email Address:</span>{" "}
              <span className="value">{request?.student.email}</span>
            </p>
            <p>
              <span className="label">Academic Adviser:</span>{" "}
              <span className="value">
                {request?.student.studentDetails.adviser}
              </span>
            </p>
            <p>
              <span className="label">Date of Clearance:</span>{" "}
              <span className="value">{renderDateCreated()}</span>
            </p>
            <p>
              <span className="label">Reason for Clearance:</span>{" "}
              <span className="value">{request?.reason}</span>
            </p>
            {renderRequestDetails()}
          </div>
        </div>
      </div>
      <Dialog
        open={openDialog}
        onClose={() => handleDialogClose(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{"Confirm Deletion"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to delete this request? This action cannot be
            undone.
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
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default StudentProfile;
