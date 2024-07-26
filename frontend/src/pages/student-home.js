import React, { useState, useEffect } from "react";
import FileUpload from "../components/file-upload";
import NotificationTile from "../components/notifs";
import StudentProfile from "../components/profile";
import * as FaIcons from "react-icons/fa";
import "react-toastify/dist/ReactToastify.css";

const StudentHomepage = () => {
  const backendUrl = process.env.REACT_APP_BACKEND_URL;

  const [studentInfo, setStudentInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [progressPercentage, setProgressPercentage] = useState(0);
  const [hasUploaded, setHasUploaded] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isNotifsLoading, setIsNotifsLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [isProfilePopupOpen, setIsProfilePopupOpen] = useState(false);

  const calculateProgress = (unitStatus) => {
    const clearedCount = unitStatus.filter(
      (status) => status.status === "Cleared"
    ).length;
    const progressPercentage = (clearedCount / unitStatus.length) * 100;
    setProgressPercentage(Math.round(progressPercentage));
  };

  const handleViewPDF = () => {
    window.location.href = `/form-pdf/${studentInfo.file}`;
  };

  const handleUpload = async (uploadedFile) => {
    setIsUploading(true);
    const formData = new FormData();
    formData.append("requestId", studentInfo._id);
    formData.append("file", uploadedFile);

    try {
      const response = await fetch(`${backendUrl}/pdf/upload`, {
        method: "POST",
        body: formData,
      });
      const body = await response.json();
      if (body.success) {
        setHasUploaded(true);
        getStudentProfile();
      } else {
        console.error("Error uploading form");
      }
    } catch (error) {
      console.error("Error uploading form:", error);
    } finally {
      setIsUploading(false);
    }
  };

  let originalNotifs = [];
  const updateNotifs = (notifId) => {
    originalNotifs = [...notifications];

    setNotifications(
      notifications.filter((notification) => notification._id !== notifId)
    );
  };

  const revertUpdate = () => {
    setNotifications(originalNotifs);
  };

  const getStudentProfile = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${backendUrl}/student/profile`, {
        method: "GET",
        credentials: "include",
      });
      const body = await response.json();
      if (body.success) {
        setStudentInfo(body.request);
        if (body.request.isSigned) {
          setHasUploaded(true);
          calculateProgress(body.request.status);
        }
      } else {
        window.location.href = "/form";
      }
    } catch (error) {
      console.error("Error fetching student profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getNotifications = async () => {
    setIsNotifsLoading(true);
    try {
      const response = await fetch(`${backendUrl}/staff/notifications`, {
        method: "GET",
        credentials: "include",
      });
      const body = await response.json();
      const unread = body.filter((notification) => !notification.read);
      setNotifications(unread);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsNotifsLoading(false);
    }
  };

  const getUpdate = () => {
    getStudentProfile();
    getNotifications();
    console.log("Polling for updates...");
  };

  useEffect(() => {
    getUpdate();
    const intervalId = setInterval(getUpdate, 180000);
    return () => clearInterval(intervalId);
  }, []);

  const renderLeft = () => {
    if (!hasUploaded && !isUploading) {
      return <FileUpload handleUpload={handleUpload} />;
    } else if (studentInfo.isReviewed === -1) {
      return (
        <div className="clearance-review">
          <FaIcons.FaCheckCircle id="check-circle" />
          <h2 className="dashboard-title">
            Your application has been submitted.
          </h2>
          <p className="dashboard-info">
            Your clearance application is currently being reviewed by CAS-OCS.
            Please be patient and wait for further notifications regarding the
            status of your application. For any queries, please email
            clearance.cas.ocs@gmail.com.
          </p>
          <button className="view-bttn" onClick={handleViewPDF}>
            {" "}
            View clearance form
          </button>
        </div>
      );
    } else if (studentInfo.isReviewed === 0) {
      return (
        <div className="clearance-review">
          <FaIcons.FaExclamationCircle id="exclamation-circle" />
          <h2 className="dashboard-title">
            Your application has been disapproved.
          </h2>
          <p className="dashboard-info" id="disapprove-reason">
            Remarks: {studentInfo.status[8].remarks}
          </p>
          <p className="dashboard-info">
            Please review your information and address the mentioned concerns
            before resubmitting your application. You may update your form by
            selecting "View Profile" and then clicking the "Edit" button. For
            any queries, please email clearance.cas.ocs@gmail.com.
          </p>
          <button className="view-bttn" onClick={() => setHasUploaded(false)}>
            {" "}
            Resubmit application
          </button>
        </div>
      );
    } else {
      return (
        <>
          <div className="clearance-progress">
            <h2>Clearance Progress</h2>
            <div className="progress-bar">
              <div
                className="progress"
                style={{ width: `${progressPercentage}%` }}
              ></div>
              <div className="progress-text">
                {progressPercentage}% completed
              </div>
            </div>
          </div>
          <div className="clearance-status">
            <h2>Clearance Status</h2>
            <table className="student-table">
              <thead>
                <tr>
                  <th>College Unit</th>
                  <th>Status</th>
                  <th>Remarks</th>
                </tr>
              </thead>
              <tbody>
                {studentInfo.status.map((status, index) => (
                  <tr key={index}>
                    <td data-label="college-unit">{status.collegeUnit}</td>
                    <td
                      data-label="status"
                      style={{ color: getStatusColor(status.status) }}
                    >
                      {status.status}
                    </td>
                    <td
                      data-label="remarks"
                      style={{ color: getRemarksColor(status.remarks) }}
                    >
                      {status.remarks}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      );
    }
  };

  return (
    <div className="home-body">
      {isLoading ? (
        <main className="student-main">
          <div className="home-column-right" id="s-loading-right">
            <div className="info-container"></div>
            <div className="info-container"></div>
          </div>
          <div className="home-column-left" id="s-loading-left">
            <div className="info-container"></div>
          </div>
        </main>
      ) : (
        <main className="student-main">
          <div className="home-column-right">
            <div className="info-container" id="container-welc">
              <h2 className="dashboard-title">
                Welcome, {studentInfo?.student.studentDetails.firstName}.
              </h2>
              <p className="dashboard-info">
                The CAS Clearance System allows you to apply for clearance,
                monitor the progress, and receive notifications about your
                application. To get started, please submit your clearance
                application form.
              </p>
              <button
                onClick={() => setIsProfilePopupOpen(!isProfilePopupOpen)}
                className="view-bttn"
                id="s-view-bttn"
              >
                View profile
              </button>
            </div>
            <div className="info-container" id="student-notif">
              <h2>Notifications</h2>
              {isNotifsLoading ? (
                <div className="loader-wrapper">
                  <div className="loader"></div>
                </div>
              ) : notifications.length === 0 ? (
                <p className="no-notification">No new notifications</p>
              ) : (
                notifications.map(
                  (notification) =>
                    !notification.read && (
                      <NotificationTile
                        key={notification._id}
                        notification={notification}
                        onUpdate={updateNotifs}
                        onRevert={revertUpdate}
                      />
                    )
                )
              )}
            </div>
          </div>
          <div className="home-column-left">
            {isUploading ? (
              <div className="info-container">
                <div className="loader-wrapper">
                  <div className="loader"></div>
                </div>
              </div>
            ) : (
              <div className="info-container">{renderLeft()}</div>
            )}
          </div>
        </main>
      )}
      <StudentProfile
        isOpen={isProfilePopupOpen}
        onClose={() => setIsProfilePopupOpen(false)}
        request={studentInfo}
        unit={-1}
      />
    </div>
  );
};

const getStatusColor = (status) => {
  switch (status.toUpperCase()) {
    case "CLEARED":
      return "#29C927";
    case "WITHHELD":
      return "#CF0B0B";
    default:
      return "gray";
  }
};

const getRemarksColor = (remarks) => {
  return remarks === "No Remarks" ? "gray" : "black";
};

export default StudentHomepage;
