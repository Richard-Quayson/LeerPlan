import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ProtectedRoute from "../components/ProtectedRoute";
import LeftPane from "../components/LeftPane";
import { CURRENT_USER_ID } from "../utility/constants";
import { USER_DETAILS_URL } from "../utility/api_urls";
import { LOGIN_ROUTE } from "../utility/routes";
import api from "../utility/api";

const DashboardPage = () => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

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
    navigate(LOGIN_ROUTE);
  }

  return (
    <ProtectedRoute>
      <div className="h-screen overflow-y-auto flex">
        <div className="w-1/4">
          <LeftPane user={user} />

          {/* LOGOUT */}
          <div className="text-center mt-4">
            <button
              onClick={() => {
                localStorage.removeItem(CURRENT_USER_ID);
                navigate(LOGIN_ROUTE);
              }}
              className="bg-red-500 text-white px-4 py-2 rounded-md"
            >
              Logout
            </button>
          </div>
        </div>

        <div className="w-3/4 pr-4"></div>
      </div>
    </ProtectedRoute>
  );
};

export default DashboardPage;
