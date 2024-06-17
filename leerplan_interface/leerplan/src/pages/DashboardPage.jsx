import React, { useEffect, useState } from "react";
import ProtectedRoute from "../components/ProtectedRoute";
import LeftPane from "../components/LeftPane";
import { CURRENT_USER_ID } from "../utility/constants";
import { USER_DETAILS_URL } from "../utility/api_urls";
import api from "../utility/api";

const DashboardPage = () => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const response = await api.get(USER_DETAILS_URL);
        setUser(response.data);
        localStorage.setItem(CURRENT_USER_ID, response.data.id);
      } catch (error) {
        setError(error.message || "Failed to fetch user details");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserDetails();
  }, []);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  console.log(user);

  return (
    <ProtectedRoute>
      <div className="h-screen overflow-y-auto flex">
        <div className="w-1/4">
          <LeftPane user={user} />
        </div>

        <div className="w-3/4 pr-4"></div>
      </div>
    </ProtectedRoute>
  );
};

export default DashboardPage;
