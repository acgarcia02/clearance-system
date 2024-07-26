import React from "react";
import * as FaIcons from "react-icons/fa";
import { formatDistanceToNow } from "date-fns";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const NotificationTile = ({ notification, onUpdate, onRevert }) => {
  const backendUrl = process.env.REACT_APP_BACKEND_URL;

  const timestamp = formatDistanceToNow(new Date(notification.timestamp), {
    addSuffix: true,
  });

  const handleRead = async () => {
    onUpdate(notification._id);
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
      onRevert();
      toast.error("Error changing read status", {
        autoClose: 5000,
        closeButton: true,
      });
    }
  };

  const handleDelete = async () => {
    onUpdate(notification._id);

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
        throw new Error("Mark as read failed");
      }
    } catch (error) {
      onRevert();
      console.error("Error deleting notification:", error);
      toast.error("Error deleting notification");
    }
  };

  return (
    <div className={`notification-tile ${notification.read ? "read" : ""}`}>
      <div className="notification-header">
        <h4 className="notification-title">{notification.title}</h4>
        <span className="notification-timestamp">{timestamp}</span>
      </div>
      <p className="notification-content">{notification.content}</p>
      <div className="notification-actions">
        <button onClick={handleRead}>
          <FaIcons.FaRegEnvelopeOpen />
        </button>
        <button onClick={handleDelete}>
          <FaIcons.FaRegTrashAlt />
        </button>
      </div>
      <ToastContainer />
    </div>
  );
};

export default NotificationTile;
