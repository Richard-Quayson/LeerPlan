import React from "react";
import { useNavigate } from "react-router-dom";

const DashboardPage = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate("/logout");
  }

  return (
    <div>
      <h1>DashBoard Page</h1>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
};

export default DashboardPage;
