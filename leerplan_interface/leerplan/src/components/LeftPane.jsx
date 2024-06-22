import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Tooltip } from "react-tooltip";
import UserProfileCard from "./UserProfileCard";
import { LOGOUT_ROUTE } from "../utility/routes";
import { CURRENT_USER_ID } from "../utility/constants";
import LeerPlanLogo from "../assets/images/leerplanlogo.png";
import FilledLogoutIcon from "../assets/icons/FilledLogout.png";
import UnfilledLogoutIcon from "../assets/icons/UnfilledLogout.png";

const LeftPane = ({ user }) => {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="left-pane">
      <img
        src={LeerPlanLogo}
        alt="LeerPlan Logo"
        className="w-16 h-16 mx-2 my-1"
      />
      <hr className="border-gray-400 w-full mb-1" />
      <hr className="border-gray-400 w-full" />
      <div className="w-full">
        <UserProfileCard user={user} />
      </div>

      {/* LOGOUT */}
      <div
        className="logout-container"
        onMouseOver={() => setIsHovered(true)}
        onMouseOut={() => setIsHovered(false)}
      >
        <button
          onClick={() => {
            localStorage.removeItem(CURRENT_USER_ID);
            navigate(LOGOUT_ROUTE);
          }}
        >
          <img
            src={isHovered ? FilledLogoutIcon : UnfilledLogoutIcon}
            alt="Logout Icon"
            className="w-12 h-12 inline-block"
            data-tooltip-id="logout"
            data-tooltip-content="Logout"
          />
        </button>
      </div>

      <Tooltip id="logout" place="bottom" />
    </div>
  );
};

export default LeftPane;
