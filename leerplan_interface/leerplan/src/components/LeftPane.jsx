import React from "react";
import LeerPlanLogo from "../assets/images/leerplanlogo.png";
import UserProfileCard from "./UserProfileCard";

const LeftPane = ({ user }) => {
  return (
    <div className="left-pane">
      <img src={LeerPlanLogo} alt="LeerPlan Logo" className="w-16 h-16" />
      <hr className="border-gray-400 w-full mb-2" />
      <hr className="border-gray-400 w-full" />
      <div className="w-full">
        <UserProfileCard user={user} />
      </div>
    </div>
  );
};

export default LeftPane;
