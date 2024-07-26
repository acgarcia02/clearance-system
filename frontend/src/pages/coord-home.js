import React, { useEffect, useState } from "react";
import RequestTable from "../components/request-table";
import Loading from "../components/loading";
import unitNames from "../components/constants";
import NotificationTile from "../components/notifs";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const CoordinatorHomepage = () => {
  const backendUrl = process.env.REACT_APP_BACKEND_URL;

  const [allClearances, setAllClearances] = useState([]);
  const [unit, setUnit] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [isNotifsLoading, setIsNotifsLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    pending: 0,
    withheld: 0,
  });

  const handleClear = async (request, newStatus, remarks, unit) => {
    const originalClearances = [...allClearances];
    setAllClearances(allClearances.filter((r) => r._id !== request._id));

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
        toast.success("Clearance status updated successfully", {
          autoClose: 5000,
          closeButton: true,
        });
      } else {
        throw new Error("Failed to update clearance status");
      }
    } catch (error) {
      console.error("Error handling clearance:", error);
      setAllClearances(originalClearances);
      toast.error(error.message, {
        autoClose: 5000,
        closeButton: true,
      });
    }
  };

  const getFilteredRequests = (allClearances, unit, status) => {
    return allClearances.filter((request) => {
      const unitStatus = request.status[unit];
      return unitStatus && unitStatus.status === status;
    });
  };

  const getMetrics = () => {
    if (allClearances) {
      setMetrics((prev) => ({
        ...prev,
        pending: getFilteredRequests(allClearances, unit, "Pending").length,
        withheld: getFilteredRequests(allClearances, unit, "Withheld").length,
      }));
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
      toast.error("Error fetching notifications", {
        autoClose: 5000,
        closeButton: true,
      });
    } finally {
      setIsNotifsLoading(false);
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

  const getRequests = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${backendUrl}/staff/requests`, {
        method: "GET",
        credentials: "include",
      });
      const body = await response.json();
      setAllClearances(body.reviewed);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getUpdate = () => {
    getRequests();
    getUser();
    getNotifications();
  };

  useEffect(() => {
    getUpdate();
    const intervalId = setInterval(getUpdate, 180000);
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    getMetrics();
  }, [allClearances]);

  return (
    <div className="home-body">
      <main className="admin-main">
        <div className="admin-notif">
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
        <div className="admin-dashboard">
          <div className="data-numbers">
            <div className="data-card">
              <h2>{metrics.pending}</h2>
              <p>Pending Applications</p>
            </div>
            <div className="data-card">
              <h2>{metrics.withheld}</h2>
              <p>Withheld Applications</p>
            </div>
          </div>
          {isLoading ? (
            <Loading rows={5} />
          ) : (
            <RequestTable
              title={`${unitNames[unit]} Clearance`}
              data={getFilteredRequests(allClearances, unit, "Pending")}
              handleApprove={handleClear}
              handleWithhold={handleClear}
              unit={unit}
            />
          )}
        </div>
      </main>
      <ToastContainer position="bottom-right" />
    </div>
  );
};

export default CoordinatorHomepage;
