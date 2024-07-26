import React, { useState, useEffect } from "react";
import * as FaIcons from "react-icons/fa";
import { Menu, MenuItem, Switch, FormControlLabel } from "@mui/material";
import NotificationTile from "../components/notif-page-tile";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const NotificationsPage = () => {
  const backendUrl = process.env.REACT_APP_BACKEND_URL;

  const [selectedButton, setSelectedButton] = useState("all");
  const [unread, setUnread] = useState([]);
  const [all, setAll] = useState([]);
  const [isNotifsLoading, setIsNotifsLoading] = useState(true);
  const [anchorEl, setAnchorEl] = useState(null);
  const [allowNotifs, setAllowNotifs] = useState(true);

  const handleKebabClick = (e) => {
    setAnchorEl(e.currentTarget);
  };

  const handleKebabClose = () => {
    setAnchorEl(null);
  };

  const handleNotifPref = async () => {
    const originalAllowNotifs = allowNotifs;
    setAllowNotifs(!allowNotifs);
    const toastId = toast.loading("Updating notification preferences...");

    try {
      const response = await fetch(`${backendUrl}/staff/notif-preferences`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ allowNotifs: !originalAllowNotifs }),
      });
      const body = await response.json();
      if (!body.success) {
        throw new Error("Update failed");
      }
      toast.update(toastId, {
        render: "Notification preferences updated",
        type: "success",
        isLoading: false,
        autoClose: 5000,
        closeButton: true,
      });
    } catch (error) {
      setAllowNotifs(originalAllowNotifs);
      toast.update(toastId, {
        render: "Error updating preferences",
        type: "error",
        isLoading: false,
        autoClose: 5000,
        closeButton: true,
      });
    }
    handleKebabClose();
  };

  const handleRead = async (notification) => {
    const originalUnread = [...unread];
    const originalAll = [...all];
    const updatedLists = all.map((notif) =>
      notif._id === notification._id
        ? { ...notif, read: !notification.read }
        : notif
    );

    setAll(updatedLists);
    setUnread(updatedLists.filter((notif) => !notif.read));

    try {
      const response = await fetch(`${backendUrl}/staff/mark-read`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          notifId: notification._id,
          read: !notification.read,
        }),
      });
      const body = await response.json();
      if (!body.success) {
        throw new Error("Failed to change read status");
      }
    } catch (error) {
      setAll(originalAll);
      setUnread(originalUnread.filter((notif) => !notif.read));
      toast.error("Error changing read status", {
        autoClose: 5000,
        closeButton: true,
      });
    }
  };

  const handleDelete = async (notification) => {
    const originalUnread = [...unread];
    const originalAll = [...all];
    setUnread(unread.filter((u) => u._id !== notification._id));
    setAll(all.filter((a) => a._id !== notification._id));

    try {
      const response = await fetch(`${backendUrl}/staff/delete-notification`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ notifId: notification._id }),
      });
      const body = await response.json();
      if (!body.success) {
        throw new Error("Delete failed");
      }
    } catch (error) {
      setUnread(originalUnread);
      setAll(originalAll);
      toast.error("Error deleting notification", {
        autoClose: 5000,
        closeButton: true,
      });
    }
  };

  const handleMarkAllAsRead = async () => {
    const originalUnread = [...unread];
    const originalAll = [...all];
    setUnread([]);
    setAll(all.map((notification) => ({ ...notification, read: true })));
    const toastId = toast.loading("Marking all notifications as read...");

    try {
      const response = await fetch(`${backendUrl}/staff/mark-all-read`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
      const body = await response.json();
      if (!body.success) {
        throw new Error("Mark all as read failed");
      }
      toast.update(toastId, {
        render: "All notifications marked as read",
        type: "success",
        isLoading: false,
        autoClose: 5000,
        closeButton: true,
      });
    } catch (error) {
      setUnread(originalUnread);
      setAll(originalAll);
      toast.update(toastId, {
        render: "Error marking all notifications as read",
        type: "error",
        isLoading: false,
        autoClose: 5000,
        closeButton: true,
      });
    }
    handleKebabClose();
  };

  const handleDeleteAll = async () => {
    const originalUnread = [...unread];
    const originalAll = [...all];
    setUnread([]);
    setAll([]);
    const toastId = toast.loading("Deleting all notifications...");

    try {
      const response = await fetch(`${backendUrl}/staff/delete-all-notifs`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
      const body = await response.json();
      if (!body.success) {
        throw new Error("Delete all failed");
      }
      toast.update(toastId, {
        render: "All notifications deleted",
        type: "success",
        isLoading: false,
        autoClose: 5000,
        closeButton: true,
      });
    } catch (error) {
      setUnread(originalUnread);
      setAll(originalAll);
      toast.update(toastId, {
        render: "Error deleting all notifications",
        type: "error",
        isLoading: false,
        autoClose: 5000,
        closeButton: true,
      });
    }
    handleKebabClose();
  };

  const renderNotifs = () => {
    const sortedNotifs = [...unread, ...all.filter((n) => n.read)];
    const notifications = selectedButton === "unread" ? unread : sortedNotifs;

    if (notifications.length === 0) {
      return <p className="no-notification">No new notifications</p>;
    } else {
      return notifications.map((notification) => (
        <NotificationTile
          key={notification._id}
          notification={notification}
          onSetRead={handleRead}
          onDelete={handleDelete}
        />
      ));
    }
  };

  useEffect(() => {
    const getNotifications = async () => {
      setIsNotifsLoading(true);
      try {
        const response = await fetch(`${backendUrl}/staff/notifications`, {
          method: "GET",
          credentials: "include",
        });
        const body = await response.json();
        const unread = body.filter((notification) => !notification.read);
        setUnread(unread);
        setAll(body);

        const prefResponse = await fetch(
          `${backendUrl}/staff/notif-preferences`,
          {
            method: "GET",
            credentials: "include",
          }
        );
        const prefBody = await prefResponse.json();
        if (prefBody.success) {
          setAllowNotifs(prefBody.allowNotifs);
        }
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
    getNotifications();
  }, []);

  return (
    <div className="home-body">
      <main className="records-main" id="notifs-main">
        <div className="records-header">
          <h2>Notifications</h2>
          <button className="kebab-menu" onClick={handleKebabClick}>
            <FaIcons.FaEllipsisV />
          </button>
          <Menu
            anchorEl={anchorEl}
            keepMounted
            open={Boolean(anchorEl)}
            onClose={handleKebabClose}
          >
            <MenuItem onClick={handleMarkAllAsRead}>Mark all as read</MenuItem>
            <MenuItem onClick={handleDeleteAll}>Delete all</MenuItem>
            <MenuItem>
              <FormControlLabel
                control={
                  <Switch
                    checked={allowNotifs}
                    onChange={handleNotifPref}
                    name="allowNotifs"
                    color="primary"
                  />
                }
                label={
                  allowNotifs
                    ? "Allow Email Notifications"
                    : "Don't Allow Email Notifications"
                }
              />
            </MenuItem>
          </Menu>
        </div>
        <div className="notifs-page-actions">
          <button
            className={selectedButton === "all" ? "active" : ""}
            onClick={() => setSelectedButton("all")}
          >
            {" "}
            All{" "}
          </button>
          <button
            className={selectedButton === "unread" ? "active" : ""}
            onClick={() => setSelectedButton("unread")}
          >
            {" "}
            Unread{" "}
          </button>
        </div>
        <div className="notification-container">
          {isNotifsLoading ? (
            <div className="loader-wrapper">
              <div className="loader"></div>
            </div>
          ) : (
            renderNotifs()
          )}
        </div>
      </main>
      <ToastContainer position="bottom-right" />
    </div>
  );
};

export default NotificationsPage;
