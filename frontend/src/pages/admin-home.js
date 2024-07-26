import React, { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import RequestTable from "../components/request-table";
import Loading from "../components/loading";
import NotificationTile from "../components/notifs";
import "react-toastify/dist/ReactToastify.css";

const AdminHomepage = () => {
  const backendUrl = process.env.REACT_APP_BACKEND_URL;

  const [newRequests, setNewRequests] = useState([]);
  const [allClearances, setAllClearances] = useState([]);
  const [unit, setUnit] = useState("");
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isNotifsLoading, setIsNotifsLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    pending: 0,
    new: 0,
    withheld: 0,
  });

  const handleApprove = async (request, status) => {
    const originalRequests = [...newRequests];
    setNewRequests(newRequests.filter((r) => r._id !== request._id));

    try {
      const response = await fetch(`${backendUrl}/staff/approve`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ requestId: request._id, status: status }),
      });
      const body = await response.json();
      if (body.success) {
        if (status === 1) {
          toast.success("Clearance application approved", {
            autoClose: 5000,
            closeButton: true,
          });
        }
      } else {
        throw new Error("Clearance approval failed");
      }
    } catch (error) {
      console.error("Error handling approval:", error);
      setNewRequests(originalRequests);
      toast.error(error.message, {
        autoClose: 5000,
        closeButton: true,
      });
    }
  };

  const handleClear = async (request, newStatus, remarks, unit) => {
    const originalClearances = [...allClearances];
    const originalRequests = [...newRequests];
    setAllClearances(allClearances.filter((r) => r._id !== request._id));
    setNewRequests(newRequests.filter((r) => r._id !== request._id));

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
        toast.success("Clearance status updated", {
          autoClose: 5000,
          closeButton: true,
        });
      } else {
        throw new Error("Failed to update clearance status");
      }
    } catch (error) {
      console.error("Error handling clearance:", error);
      setAllClearances(originalClearances);
      setNewRequests(originalRequests);
      toast.error(error.message, {
        autoClose: 5000,
        closeButton: true,
      });
    }
  };

  const handleDisapprove = async (request, remarks) => {
    handleApprove(request, 0);
    handleClear(request, "Withheld", remarks, 8);
  };

  const handleDelete = async (request) => {
    const originalClearances = [...allClearances];
    const originalRequests = [...newRequests];
    setAllClearances(allClearances.filter((r) => r._id !== request._id));
    setNewRequests(newRequests.filter((r) => r._id !== request._id));

    try {
      const response = await fetch(`${backendUrl}/staff/delete-student`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: request.student._id }),
      });
      const body = await response.json();
      if (body.success) {
        toast.success("Request deleted successfully", {
          autoClose: 5000,
          closeButton: true,
        });
      } else {
        throw new Error("Delete failed");
      }
    } catch (error) {
      console.error("Error deleting request:", error);
      setAllClearances(originalClearances);
      setNewRequests(originalRequests);
      toast.error(error.message, {
        autoClose: 5000,
        closeButton: true,
      });
    }
  };

  const getMetrics = () => {
    if (allClearances && newRequests) {
      let numWh = 0;
      let pending = 0;
      allClearances.forEach((request) => {
        if (request.status[8].status === "Withheld") {
          numWh++;
        } else if (request.status[8].status === "Pending") {
          pending++;
        }
      });

      setMetrics((prev) => ({
        ...prev,
        pending: pending,
        new: newRequests.length,
        withheld: numWh,
      }));
    }
  };

  const getFilteredRequests = (allClearances) => {
    return allClearances.filter((request) => {
      const clearedCount = request.status.filter(
        (status) => status.status === "Cleared"
      ).length;
      return clearedCount === 8;
    });
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
      setNewRequests(body.unreviewed);
      setAllClearances(body.reviewed);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getUpdate = () => {
    getRequests();
    getNotifications();
    getUser();
  };

  useEffect(() => {
    getUpdate();
    const intervalId = setInterval(getUpdate, 180000);
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    getMetrics();
  }, [allClearances, newRequests]);

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
              <h2>{metrics.new}</h2>
              <p>New Applications</p>
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
              title="New Clearance Applications"
              data={newRequests}
              handleApprove={handleApprove}
              handleWithhold={handleDisapprove}
              handleDelete={handleDelete}
              unit={unit}
            />
          )}

          {isLoading ? (
            <Loading rows={5} />
          ) : (
            <RequestTable
              title="OCS Clearance"
              data={getFilteredRequests(allClearances)}
              handleApprove={handleClear}
              handleWithhold={handleClear}
              handleDelete={handleDelete}
              unit={unit}
            />
          )}
        </div>
      </main>
      <ToastContainer position="bottom-right" />
    </div>
  );
};

export default AdminHomepage;
