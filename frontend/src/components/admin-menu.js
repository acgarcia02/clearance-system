import React from 'react';
import * as FaIcons from "react-icons/fa";

export const AdminMenuOptions = [
    {
        label: 'Home',
        icon: <FaIcons.FaHome />,
        path: '/'
    },
    {
        label: 'Notifications',
        icon: <FaIcons.FaBell />,
        path: '/notifications'
    },
    {
        label: 'Clearance Records',
        icon: <FaIcons.FaRegFileAlt />,
        path: '/records'
    },
    {
        label: 'Coordinators',
        icon: <FaIcons.FaUserFriends />,
        path: '/coordinators'
    },
]