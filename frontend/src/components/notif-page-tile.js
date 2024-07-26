import React, { useState } from "react";
import * as FaIcons from "react-icons/fa";
import { Menu, MenuItem } from "@mui/material";
import { formatDistanceToNow } from "date-fns";

const NotificationTile = ({ notification, onSetRead, onDelete }) => {
  const [anchorEl, setAnchorEl] = useState(null);

  const handleKebabClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleKebabClose = () => {
    setAnchorEl(null);
  };

  const handleMarkAsRead = () => {
    onSetRead(notification);
    handleKebabClose();
  };

  const handleDelete = () => {
    onDelete(notification);
    handleKebabClose();
  };

  return (
    <div className={`notif-tile ${notification.read ? "read" : ""}`}>
      <div className="records-header">
        <h3>{notification.title}</h3>
        <button
          className="kebab-menu"
          id="notif-kebab"
          onClick={handleKebabClick}
        >
          <FaIcons.FaEllipsisV />
        </button>
        <Menu
          anchorEl={anchorEl}
          keepMounted
          open={Boolean(anchorEl)}
          onClose={handleKebabClose}
        >
          <MenuItem onClick={handleMarkAsRead}>
            {notification.read ? "Mark as Unread" : "Mark as Read"}
          </MenuItem>
          <MenuItem onClick={handleDelete}>Delete</MenuItem>
        </Menu>
      </div>
      <p>{notification.content}</p>
      <p id="notif-time">
        {formatDistanceToNow(new Date(notification.timestamp), {
          addSuffix: true,
        })}
      </p>
    </div>
  );
};

export default NotificationTile;
