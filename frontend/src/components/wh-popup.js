import React, { useState } from "react";
import * as FaIcons from "react-icons/fa";

const WithheldPopup = ({ isOpen, onClose, onConfirm, request, unit }) => {
  const [remarks, setRemarks] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleConfirm = () => {
    if (!remarks) {
      setErrorMessage("Please enter remarks.");
      return;
    }
    setErrorMessage("");
    if (request.isReviewed === -1) {
      onConfirm(request, remarks);
    } else {
      onConfirm(request, "Withheld", remarks, unit);
    }
    setRemarks("");
    onClose();
  };

  return (
    <div className={`popup-overlay ${isOpen ? "open" : ""}`}>
      <div className="popup-container">
        <button className="close-button" onClick={onClose}>
          <FaIcons.FaTimes />
        </button>
        <h3>
          <FaIcons.FaMinusCircle className="icon" />
          Withhold Clearance
        </h3>
        <p className="wh-p">
          Student:{" "}
          {request?.student.studentDetails.lastName +
            ", " +
            request?.student.studentDetails.firstName +
            " " +
            request?.student.studentDetails.middleName}
        </p>
        <p className="wh-p">
          ({request?.student.studentDetails.studentNumber})
        </p>
        <div className="wh-container">
          <label htmlFor="remarks" className="wh-remarks">
            Remarks
          </label>
          <textarea
            id="remarks"
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
          />
        </div>
        {errorMessage && <p className="error-message">{errorMessage}</p>}
        <div className="popup-button-container">
          <button className="popup-button" onClick={handleConfirm}>
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default WithheldPopup;
