import React from "react";
import SearchIcon from "../assets/icons/Search.png";
import NotificationIcon from "../assets/icons/Notification.png";

const HorizontalNavigation = ({ title }) => {
  return (
    <div className="flex items-center justify-between h-20 pl-10 pr-4 text-yellow-700 shadow-md">
      <h1 className="text-2xl font-bold">{title}</h1>
      <div className="flex items-center space-x-4">
        <img src={SearchIcon} alt="Search" className="w-6 h-6 cursor-pointer" />
        <img
          src={NotificationIcon}
          alt="Notification"
          className="w-6 h-6 cursor-pointer"
        />
      </div>
    </div>
  );
};

export default HorizontalNavigation;
