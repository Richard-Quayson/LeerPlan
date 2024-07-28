import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ProtectedRoute from "../components/ProtectedRoute";
import LeftPane from "../components/LeftPane";
import RightPane from "../components/RightPane";
import api from "../utility/api";
import { USER_COURSE_LIST_URL } from "../utility/api_urls";
import { CURRENT_USER_ID, DISPLAY_TIME_BLOCKS } from "../utility/constants";
import { USER_DETAILS_URL } from "../utility/api_urls";
import { LOGIN_ROUTE } from "../utility/routes";
import LoadingGif from "../assets/gifs/Loading.gif";

const DashboardPage = () => {
  const [user, setUser] = useState(null);
  const [userCourses, setUserCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [displayTimeBlocks, setDisplayTimeBlocks] = useState(
    localStorage.getItem(DISPLAY_TIME_BLOCKS) === "true"
  );
  const navigate = useNavigate();

  const handleTimeBlocksToggle = (newDisplayTimeBlocks) => {
    setDisplayTimeBlocks(newDisplayTimeBlocks);
  };

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

  if (error) {
    navigate(LOGIN_ROUTE);
  }

  return (
    <ProtectedRoute>
      <div className="h-screen flex">
        <div className="w-1/4 overflow-y-auto">
          {user && userCourses && (
            <LeftPane
              user={user}
              userCourses={userCourses}
              onTimeBlocksToggle={handleTimeBlocksToggle}
              setIsLoading={setIsLoading}
            />
          )}
        </div>
        <div className="w-3/4 overflow-y-auto">
          {userCourses && user.extended_routines && (
            <RightPane
              courses={userCourses}
              userRoutines={user.extended_routines}
              userMetadata={user.metadata ? user.metadata : {}}
              displayTimeBlocks={displayTimeBlocks}
            />
          )}
        </div>

        {isLoading && (
          <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white rounded-lg">
              <img src={LoadingGif} alt="Loading" className="w-32 h-32" />
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
};

export default DashboardPage;
