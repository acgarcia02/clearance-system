import React, { useState } from "react";
import * as FaIcons from "react-icons/fa";
import WithheldPopup from "./wh-popup";
import StudentProfile from "./profile";
import { format } from "date-fns";

const RequestTable = ({
  title,
  data,
  handleApprove,
  handleWithhold,
  handleDelete,
  unit,
}) => {
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [currentPage, setCurrentPage] = useState(0);
  const [isWithheldPopupOpen, setIsWithheldPopupOpen] = useState(false);
  const [isProfilePopupOpen, setIsProfilePopupOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);

  const handlePageChange = (page) => {
    setCurrentPage((prevPage) =>
      page === "next"
        ? Math.min(prevPage + 1, Math.ceil(data.length / rowsPerPage) - 1)
        : Math.max(prevPage - 1, 0)
    );
  };

  const handleRowsPerPage = (e) => {
    setRowsPerPage(parseInt(e.target.value));
    setCurrentPage(0);
  };

  const getVisibleRequests = () => {
    const start = currentPage * rowsPerPage;
    return data.slice(start, start + rowsPerPage);
  };

  const handleWithheld = (e, r) => {
    e.stopPropagation();
    setIsWithheldPopupOpen(!isWithheldPopupOpen);
    setSelectedRequest(r);
  };

  const handleConfirm = (e, r) => {
    e.stopPropagation();
    if (r.isReviewed === -1) {
      handleApprove(r, 1);
    } else {
      handleApprove(r, "Cleared", "No Remarks", unit);
    }
  };

  const handleOpen = (r) => {
    setIsProfilePopupOpen(!isProfilePopupOpen);
    setSelectedRequest(r);
  };

  const renderStatus = (request, unit, handleApprove, handleWithheld) => {
    const unitStatus = request?.status[unit];
    switch (unitStatus?.status) {
      case "Cleared":
        return <p style={{ color: "#29C927" }}>CLEARED</p>;
      case "Withheld":
        return (
          <>
            <p style={{ color: "#CF0B0B" }}>WITHHELD</p>
            <button
              className="disapprove"
              onClick={() =>
                handleApprove(request, "Pending", "No Remarks", unit)
              }
            >
              Resolve
            </button>
          </>
        );
      default:
        return (
          <>
            <button
              className="approve"
              onClick={(e) => handleConfirm(e, request)}
            >
              Approve
            </button>
            <button
              className="disapprove"
              onClick={(e) => handleWithheld(e, request)}
            >
              Disapprove
            </button>
          </>
        );
    }
  };

  return (
    <div className="admin-new-requests">
      <div className="table-header">
        <h2>{title}</h2>
        <select
          id="rowsPerPageNewReqs"
          value={rowsPerPage}
          onChange={handleRowsPerPage}
        >
          <option value={5}>5</option>
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={data.length}>All</option>
        </select>
      </div>
      <table className="admin-table">
        <thead>
          <tr>
            <th>Student Number</th>
            <th>Name</th>
            <th>Degree Program</th>
            <th>Date of Request</th>
            <th>Reason for Requesting</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody className="new-reqs-tbody">
          {getVisibleRequests().length === 0 ? (
            <tr>
              <td colSpan="6">No requests found.</td>
            </tr>
          ) : (
            getVisibleRequests().map((r, index) => (
              <tr key={index} onClick={() => handleOpen(r)}>
                <td data-label="studentno">
                  {r.student.studentDetails.studentNumber}
                </td>
                <td data-label="name">
                  {r.student.studentDetails.lastName +
                    ", " +
                    r.student.studentDetails.firstName +
                    " " +
                    r.student.studentDetails.middleName}
                </td>
                <td data-label="degprog">
                  {r.student.studentDetails.degreeProgram}
                </td>
                <td data-label="date">
                  {format(new Date(r.dateCreated), "dd MMM yyyy")}
                </td>
                <td data-label="reason">{r.reason}</td>
                <td data-label="actions">
                  {renderStatus(r, unit, handleApprove, handleWithheld)}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      <div className="page-buttons">
        <button
          onClick={() => handlePageChange("prev")}
          disabled={currentPage === 0}
        >
          <FaIcons.FaChevronLeft />
        </button>
        <button
          onClick={() => handlePageChange("next")}
          disabled={currentPage === Math.ceil(data.length / rowsPerPage) - 1}
        >
          <FaIcons.FaChevronRight />
        </button>
      </div>
      <StudentProfile
        isOpen={isProfilePopupOpen}
        onClose={() => setIsProfilePopupOpen(false)}
        onDelete={handleDelete}
        request={selectedRequest}
        unit={unit}
      />
      <WithheldPopup
        isOpen={isWithheldPopupOpen}
        onClose={() => setIsWithheldPopupOpen(false)}
        onConfirm={handleWithhold}
        request={selectedRequest}
        unit={unit}
      />
    </div>
  );
};

export default RequestTable;
