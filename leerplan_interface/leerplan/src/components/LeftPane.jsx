import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Tooltip } from "react-tooltip";
import UserProfileCard from "./UserProfileCard";
import CourseList from "./CourseList";
import { LOGOUT_ROUTE } from "../utility/routes";
import { CURRENT_USER_ID } from "../utility/constants";
import { USER_COURSE_LIST_URL } from "../utility/api_urls";
import api from "../utility/api";
import LeerPlanLogo from "../assets/images/leerplanlogo.png";
import FilledLogoutIcon from "../assets/icons/FilledLogout.png";
import UnfilledLogoutIcon from "../assets/icons/UnfilledLogout.png";

const LeftPane = ({ user }) => {
  const [userCourses, setUserCourses] = useState([]);
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const fetchUserCourses = async () => {
      try {
        const response = await api.get(USER_COURSE_LIST_URL);
        setUserCourses(response.data);
      } catch (error) {
        setUserCourses([]);
      }
    };

    fetchUserCourses();
  }, []);

  return (
    <div className="left-pane">
      {/* LOGO */}
      <img
        src={LeerPlanLogo}
        alt="LeerPlan Logo"
        className="w-16 h-16 mx-2 my-1"
      />

      {/* LINE SEPARATORS */}
      <hr className="border-gray-400 w-full mb-1" />
      <hr className="border-gray-400 w-full" />

      {/* USER PROFILE CARD */}
      <div className="w-full">
        <UserProfileCard user={user} />
      </div>

      {/* LINE SEPARATOR */}
      <hr className="border-gray-200 w-full" />

      {/* COURSE DIRECTORY */}
      <div className="w-full">
        <CourseList courses={userCourses} />
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
