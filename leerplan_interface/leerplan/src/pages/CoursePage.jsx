import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import ProtectedRoute from "../components/ProtectedRoute";
import LeftPane from "../components/LeftPane";
import HorizontalNavigation from "../components/HorizontalNavigation";
import api from "../utility/api";
import { USER_COURSE_LIST_URL, USER_DETAILS_URL } from "../utility/api_urls";
import { CURRENT_USER_ID } from "../utility/constants";
import { LOGIN_ROUTE } from "../utility/routes";

const CoursePage = () => {
  const [user, setUser] = useState(null);
  const [userCourses, setUserCourses] = useState([]);
  const [course, setCourse] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { courseCode } = location.state || {};

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

  useEffect(() => {
    if (userCourses && userCourses.length > 0 && courseCode) {
      const course = userCourses.find(
        (course) => course.course.code === courseCode
      );
      setCourse(course);
    }
  }, [userCourses, courseCode]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    navigate(LOGIN_ROUTE);
  }

  console.log(course);

  return (
    <ProtectedRoute>
      <div className="h-screen overflow-y-auto flex">
        <div className="w-1/4">
          {user && userCourses && (
            <LeftPane user={user} userCourses={userCourses} />
          )}
        </div>
        <div className="w-3/4">
          {course ? (
            <div className="flex flex-col h-full">
              <HorizontalNavigation
                title={course.course.code + " " + course.course.name}
              />
            </div>
          ) : (
            <div className="h-full flex items-center justify-center">
              <h1 className="text-2xl text-gray-400">Course not found</h1>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default CoursePage;
