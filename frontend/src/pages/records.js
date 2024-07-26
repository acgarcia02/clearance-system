import React, { useEffect, useState } from "react";
import * as FaIcons from "react-icons/fa";
import FilterPopup from "../components/filter";
import Loading from "../components/loading";
import WithheldPopup from "../components/wh-popup";
import StudentProfile from "../components/profile";
import { format } from "date-fns";
import * as XLSX from "xlsx";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ClearanceRecords = () => {
  const backendUrl = process.env.REACT_APP_BACKEND_URL;

  const [isFilterPopupOpen, setIsFilterPopupOpen] = useState(false);
  const [isWithheldPopupOpen, setIsWithheldPopupOpen] = useState(false);
  const [requests, setRequests] = useState([]);
  const [unit, setUnit] = useState(0);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isProfilePopupOpen, setIsProfilePopupOpen] = useState(false);

  const handleWithheld = (e, r) => {
    e.stopPropagation();
    setIsWithheldPopupOpen(!isWithheldPopupOpen);
    setSelectedRequest(r);
  };

  const handleOpen = (r) => {
    setIsProfilePopupOpen(!isProfilePopupOpen);
    setSelectedRequest(r);
  };

  const handleSearch = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    const filtered = requests.filter(
      (request) =>
        request.student.studentDetails.lastName
          .toLowerCase()
          .includes(query.toLowerCase()) ||
        request.student.studentDetails.firstName
          .toLowerCase()
          .includes(query.toLowerCase()) ||
        request.student.studentDetails.studentNumber
          .toLowerCase()
          .includes(query.toLowerCase())
    );
    setFilteredRequests(filtered);
  };

  const handleExport = () => {
    const workbook = XLSX.utils.book_new();
    const sheetData = filteredRequests.map((r) => {
      const data = {
        "Student Number": r.student.studentDetails.studentNumber,
        Name: `${r.student.studentDetails.lastName}, ${r.student.studentDetails.firstName} ${r.student.studentDetails.middleName}`,
        "Degree Program": r.student.studentDetails.degreeProgram,
        "Date of Request": format(new Date(r.dateCreated), "dd MMM yyyy"),
        "Reason for Requesting": r.reason,
      };
      if (r.reason === "Graduating") {
        data.Semester = r.semester;
        data["Academic Year"] = r.acadYear;
      } else if (r.reason === "Transferring") {
        data["Shift To"] = r.shiftTo;
      }
      data["Status"] = r.status[unit]?.status;

      return data;
    });

    const worksheet = XLSX.utils.json_to_sheet(sheetData);
    XLSX.utils.book_append_sheet(workbook, worksheet, "Requests");
    XLSX.writeFile(workbook, "requests.xlsx");
  };

  const getNumCleared = (r) => {
    const numCleared = r.status.filter(
      (status) => status.status === "Cleared"
    ).length;
    r.numCleared = numCleared;
  };

  const renderStatus = (request, unit, handleClear, handleWithheld) => {
    const unitStatus = request?.status[unit];
    const numCleared = request.numCleared;

    if (unit === 8 && numCleared < 8) {
      return <p style={{ color: "#FFA500" }}>PENDING</p>;
    }

    switch (unitStatus?.status) {
      case "Cleared":
        return <p style={{ color: "#29C927" }}>CLEARED</p>;
      case "Withheld":
        return (
          <>
            <p style={{ color: "#CF0B0B" }}>WITHHELD</p>
            <button
              className="disapprove"
              onClick={(e) => {
                e.stopPropagation();
                handleClear(request, "Pending", "No Remarks", unit);
              }}
            >
              Resolve
            </button>
          </>
        );
      case "Processing":
        return <p style={{ color: "#FFA500" }}>PROCESSING</p>;
      default:
        return (
          <>
            <button
              className="approve"
              onClick={(e) => {
                e.stopPropagation();
                handleClear(request, "Cleared", "No Remarks", unit);
              }}
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

  const handleClear = async (request, newStatus, remarks, unit) => {
    const originalRequests = [...requests];
    const originalFilteredRequests = [...filteredRequests];

    setRequests((prev) =>
      prev.map((req) =>
        req._id === request._id
          ? {
              ...req,
              status: req.status.map((s, i) =>
                i === unit ? { ...s, status: "Processing" } : s
              ),
            }
          : req
      )
    );
    setFilteredRequests((prev) =>
      prev.map((req) =>
        req._id === request._id
          ? {
              ...req,
              status: req.status.map((s, i) =>
                i === unit ? { ...s, status: "Processing" } : s
              ),
            }
          : req
      )
    );

    const toastId = toast.loading("Processing clearance...");

    try {
      const response = await fetch(`${backendUrl}/staff/clear`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          request: request,
          newStatus: newStatus,
          remarks: remarks,
          unit: unit,
        }),
      });
      const body = await response.json();
      if (body.success) {
        getNumCleared(body.request);
        setRequests((prev) =>
          prev.map((req) => (req._id === body.request._id ? body.request : req))
        );
        setFilteredRequests((prev) =>
          prev.map((req) => (req._id === body.request._id ? body.request : req))
        );
        toast.update(toastId, {
          render: "Clearance status updated",
          type: "success",
          isLoading: false,
          autoClose: 5000,
          closeButton: true,
        });
      } else {
        throw new Error("Failed to update clearance status");
      }
    } catch (error) {
      console.error("Error handling approval:", error);
      setRequests(originalRequests);
      setFilteredRequests(originalFilteredRequests);
      toast.update(toastId, {
        render: "Error handling clearance",
        type: "error",
        isLoading: false,
        autoClose: 5000,
        closeButton: true,
      });
    }
  };

  const handleDelete = async (request) => {
    const originalRequests = [...requests];
    const originalFilteredRequests = [...filteredRequests];
    setRequests(requests.filter((r) => r._id !== request._id));
    setFilteredRequests(filteredRequests.filter((r) => r._id !== request._id));
    const toastId = toast.loading("Deleting request...");

    try {
      const response = await fetch(`${backendUrl}/staff/delete-student`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: request.student._id }),
      });
      const body = await response.json();
      if (!body.success) {
        throw new Error("Delete failed");
      }
      toast.update(toastId, {
        render: "Request deleted successfully",
        type: "success",
        isLoading: false,
        autoClose: 5000,
        closeButton: true,
      });
    } catch (error) {
      toast.update(toastId, {
        render: "Error deleting request",
        type: "error",
        isLoading: false,
        autoClose: 5000,
        closeButton: true,
      });
      setRequests(originalRequests);
      setFilteredRequests(originalFilteredRequests);
    }
  };

  const getUser = async () => {
    try {
      const response = await fetch(`${backendUrl}/staff/user`, {
        method: "GET",
        credentials: "include",
      });
      const body = await response.json();
      setUnit(body.unit);
    } catch (error) {
      console.error("Error fetching department:", error);
    }
  };

  const getAllRequests = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${backendUrl}/staff/requests`, {
        method: "GET",
        credentials: "include",
      });
      const body = await response.json();
      for (const r of body.reviewed) {
        getNumCleared(r);
      }
      setRequests(body.reviewed);
      setFilteredRequests(body.reviewed);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Error fetching requests", {
        autoClose: 5000,
        closeButton: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const getUpdate = () => {
      getAllRequests();
      getUser();
    };
    getUpdate();
    const intervalId = setInterval(getUpdate, 180000);
    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="home-body">
      <main className="records-main">
        <div className="records-header">
          <h2>Clearance Records</h2>
          <button id="dl-bttn" onClick={handleExport}>
            Download Records
          </button>
        </div>
        <div className="records-header">
          <div className="search">
            <input
              type="text"
              placeholder="Search by name or student number..."
              value={searchQuery}
              onChange={handleSearch}
            ></input>
          </div>
          <div
            className="kebab-menu"
            onClick={() => setIsFilterPopupOpen(!isFilterPopupOpen)}
          >
            <FaIcons.FaEllipsisV />
          </div>
        </div>
        {isLoading ? (
          <Loading rows={10} />
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Student Number</th>
                <th>Name</th>
                <th>Degree Program</th>
                <th>Date of Request</th>
                <th>Reason for Requesting</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody className="records-tbody">
              {filteredRequests.length !== 0 ? (
                filteredRequests.map((r, index) => (
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
                    <td data-label="reason">
                      <p>{r.reason} </p>
                      {r.reason === "Graduating" && (
                        <p className="req-details">
                          {r.semester + " " + r.acadYear}
                        </p>
                      )}
                      {r.reason === "Transferring" && (
                        <p className="req-details">{r.shiftTo}</p>
                      )}
                    </td>
                    <td data-label="status">{r.numCleared}/9</td>
                    <td data-label="actions">
                      {renderStatus(r, unit, handleClear, handleWithheld)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7">No requests found.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </main>
      <ToastContainer position="bottom-right" />
      <FilterPopup
        isOpen={isFilterPopupOpen}
        onClose={() => setIsFilterPopupOpen(false)}
        requests={requests}
        setFilteredRequests={setFilteredRequests}
        unit={unit}
      />
      <WithheldPopup
        isOpen={isWithheldPopupOpen}
        onClose={() => setIsWithheldPopupOpen(false)}
        onConfirm={handleClear}
        request={selectedRequest}
        unit={unit}
      />
      <StudentProfile
        isOpen={isProfilePopupOpen}
        onClose={() => setIsProfilePopupOpen(false)}
        onDelete={handleDelete}
        request={selectedRequest}
        unit={unit}
      />
    </div>
  );
};

export default ClearanceRecords;
