import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import moment from "moment";
import ProtectedRoute from "../components/ProtectedRoute";
import LeftPane from "../components/LeftPane";
import HorizontalNavigation from "../components/HorizontalNavigation";
import CourseInstructorCard from "../components/CourseInstructorCard";
import WeeklySchedule from "../components/WeeklySchedule";
import api from "../utility/api";
import { USER_COURSE_LIST_URL, USER_DETAILS_URL } from "../utility/api_urls";
import { CURRENT_USER_ID } from "../utility/constants";
import { LOGIN_ROUTE, DASHBOARD_ROUTE } from "../utility/routes";
import LocationIcon from "../assets/icons/Location.png";
import BookIcon from "../assets/icons/Book.png";

const CoursePage = () => {
  const [user, setUser] = useState(null);
  const [userCourses, setUserCourses] = useState([]);
  const [course, setCourse] = useState(null);
  const [lecturers, setLecturers] = useState([]);
  const [facultyInterns, setFacultyInterns] = useState([]);
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

      // if course code is empty, navigate to dashboard
      if (!course.cohort) {
        navigate(DASHBOARD_ROUTE);
      }

      setCourse(course);
    }
  }, [userCourses, courseCode]);

  // filter instructors based on type
  useEffect(() => {
    if (course) {
      const lecturers = course.course.instructors.filter(
        (instructor) => instructor.instructor.type === "Lecturer"
      );
      setLecturers(lecturers);

      const facultyInterns = course.course.instructors.filter(
        (instructor) => instructor.instructor.type === "Faculty Intern"
      );
      setFacultyInterns(facultyInterns);
    }
  }, [course]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    navigate(LOGIN_ROUTE);
  }

  return (
    <ProtectedRoute>
      <div className="flex h-screen overflow-hidden">
        <div className="w-1/4 flex-shrink-0 overflow-y-auto">
          {user && userCourses && (
            <LeftPane user={user} userCourses={userCourses} />
          )}
        </div>
        <div className="w-3/4 flex-grow flex flex-col overflow-hidden">
          {course ? (
            <>
              <div className="flex-shrink-0">
                <HorizontalNavigation
                  title={course.course.code + " " + course.course.name}
                />
              </div>
              <div className="flex-grow overflow-y-auto">
                <div className="flex flex-col">
                  {/* COURSE SEMESTER */}
                  <div className="flex items-center justify-between mx-4 my-2">
                    <div className="text-sm text-yellow-800">
                      Offered by {course.course.university.name} in{" "}
                      {course.course.semester.name},{" "}
                      {course.course.semester.year}.
                    </div>
                    <div className="text-sm text-gray-400">
                      Created on{" "}
                      {moment(course.course.date_created).format(
                        "MMMM DD, YYYY"
                      )}
                      .
                    </div>
                  </div>

                  {/* COURSE DESCRIPTION */}
                  <div className="mx-4 my-2">
                    <div className="text-[18px] font-semibold text-yellow-800 mb-1">
                      Course Description:
                    </div>
                    <div className="ml-4 text-[15px] text-justify leading-[1.4] text-gray-500">
                      {course.course.description}
                    </div>
                  </div>

                  {/* COURSE INSTRUCTORS */}
                  <div className="mx-4 my-2">
                    <div className="text-[18px] font-semibold text-yellow-800 mb-2">
                      Course Instructors:
                    </div>
                    {/* LECTURERS */}
                    <div className="flex flex-wrap ml-4 h-auto text-[15px] text-gray-500">
                      {lecturers.map((instructor) => (
                        <CourseInstructorCard
                          key={instructor.id}
                          instructor={instructor}
                        />
                      ))}
                    </div>

                    {/* FACULTY INTERNS */}
                    <div className="flex flex-wrap ml-4 h-auto text-[15px] text-gray-500">
                      {facultyInterns.map((instructor) => (
                        <CourseInstructorCard
                          key={instructor.id}
                          instructor={instructor}
                        />
                      ))}
                    </div>
                  </div>

                  {/* LECTURE DAYS AND EVALUATION CRITERIA */}
                  <div className="flex">
                    {/* LECTURE DAYS */}
                    <div className="w-2/5 mx-4 my-2">
                      <div className="text-[18px] font-semibold text-yellow-800 mb-2">
                        Lecture Days:
                      </div>
                      <div className="ml-4 text-[15px] text-gray-500">
                        {course.cohort.lecture_days.map((lecture_day) => (
                          <div
                            key={lecture_day.id}
                            className="mb-2 p-2 border border-yellow-800"
                          >
                            <div className="flex items-center mb-2">
                              {lecture_day.day.charAt(0).toUpperCase() +
                                lecture_day.day.slice(1)}
                              , From{" "}
                              {moment(
                                lecture_day.start_time,
                                "HH:mm:ss"
                              ).format("HH:mm")}{" "}
                              to{" "}
                              {moment(lecture_day.end_time, "HH:mm:ss").format(
                                "HH:mm"
                              )}
                            </div>
                            <div className="flex items-center">
                              <img
                                src={LocationIcon}
                                alt="Location"
                                className="w-4 h-4 ml-2"
                              />
                              <span className="ml-2">
                                {lecture_day.location}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* EVALUATION CRITERIA */}
                    <div className="w-3/5 mx-4 my-2">
                      <div className="text-[18px] font-semibold text-yellow-800 mb-2">
                        Evaluation Criteria:
                      </div>
                      <table className="min-w-full border border-yellow-800">
                        <thead>
                          <tr className="border-b border-yellow-800">
                            <th className="py-2 px-4 text-center text-yellow-700 border-r border-yellow-800">
                              Type
                            </th>
                            <th className="py-2 px-4 text-center text-yellow-700">
                              Weight (%)
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {course.course.evaluation_criteria.map((criteria) => (
                            <tr
                              key={criteria.id}
                              className="border-b border-yellow-800"
                            >
                              <td className="py-2 px-4 text-yellow-800 border-r border-yellow-800">
                                {criteria.type}
                              </td>
                              <td className="py-2 px-4 text-yellow-800">
                                {criteria.weight}%
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* TEXTBOOKS */}
                  <div className="mx-4 my-2 text-gray-500">
                    <div className="text-[18px] font-semibold text-yellow-800 mb-2">
                      Textbooks:
                    </div>

                    {/* Primary Textbooks */}
                    <div className="ml-4 text-[15px]">
                      <div className="text-[16px] font-semibold text-yellow-800 mb-1">
                        Primary Textbooks
                      </div>
                      <ul className="list-disc list-inside">
                        {course.course.textbooks
                          .filter((book) => book.type === "primary")
                          .map((book) => (
                            <li
                              key={book.id}
                              className="flex items-center mb-1"
                            >
                              <img
                                src={BookIcon}
                                alt="Book"
                                className="w-4 h-4 mr-2"
                              />
                              <span>{book.title}</span>
                            </li>
                          ))}
                      </ul>
                    </div>

                    {/* Secondary Textbooks */}
                    <div className="ml-4 text-[15px]">
                      <div className="text-[16px] font-semibold text-yellow-800 mb-1">
                        Secondary Textbooks
                      </div>
                      <ul className="list-disc list-inside">
                        {course.course.textbooks
                          .filter((book) => book.type === "secondary")
                          .map((book) => (
                            <li
                              key={book.id}
                              className="flex items-center mb-1"
                            >
                              <img
                                src={BookIcon}
                                alt="Book"
                                className="w-4 h-4 mr-2"
                              />
                              <span>{book.title}</span>
                            </li>
                          ))}
                      </ul>
                    </div>
                  </div>

                  {/* WEEKLY SCHEDULE */}
                  <div className="mx-4 my-2">
                    <div className="text-[18px] font-semibold text-yellow-800 mb-2">
                      Weekly Schedule:
                    </div>
                    <div className="flex flex-wrap ml-4">
                      {course.course.weekly_schedules.map((schedule) => (
                        <div key={schedule.id} className="w-[425px] p-2 flex">
                          <div className="border border-yellow-800 text-gray-500 p-4 rounded-lg shadow-md flex flex-col flex-grow">
                            <WeeklySchedule weeklySchedule={schedule} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="h-full flex items-center justify-center">
              <h1 className="text-xl text-gray-400">
                No course exists with code {courseCode}
              </h1>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default CoursePage;
