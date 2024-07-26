import React from 'react';
import * as FaIcons from "react-icons/fa";

export const StudentMenuOptions  = (fileId) => [
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
        label: 'Clearance Form',
        icon: <FaIcons.FaRegFileAlt />,
        path: `/form-pdf/${fileId}`
    },
]