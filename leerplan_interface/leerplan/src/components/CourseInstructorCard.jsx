import React from "react";
import { INSTRUCTOR_TYPES } from "../utility/constants";
import EmailIcon from "../assets/icons/DarkEmail.png";
import PhoneIcon from "../assets/icons/Phone.png";
import MeetingTimeIcon from "../assets/icons/MeetingTime.png";
import CoursesIcon from "../assets/icons/Courses.png";

const CourseInstructorCard = ({ instructor }) => {
  const { name, email, phone, type, courses } = instructor.instructor;
  const officeHours = instructor.office_hours;
  console.log(instructor);

  const borderColor =
    type === "Lecturer" ? "border-yellow-600" : "border-yellow-800";
  const backgroundColor = type === "Lecturer" ? "bg-yellow-100" : "bg-white";

  return (
    <div
      className={`border ${borderColor} rounded-lg p-4 ${backgroundColor} mb-4 mr-8 max-w-[300px]`}
    >
      {/* NAME */}
      <div className="text-lg font-semibold text-yellow-800">{name}</div>
      {/* EMAIL */}
      <div className="text-gray-500 flex items-center mt-2">
        <img src={EmailIcon} alt="Email" className="w-4 h-4 mr-2" />
        <span>{email}</span>
      </div>
      {/* PHONE */}
      <div className="text-gray-500 flex items-center mt-2">
        <img src={PhoneIcon} alt="Phone" className="w-4 h-4 mr-2" />
        <span>
          {phone ? phone : <span className="text-red-600">Not specified</span>}
        </span>
      </div>
      {/* INSTRUCTOR TYPE */}
      <div className="text-gray-500 mt-2">{INSTRUCTOR_TYPES[type]}</div>
      {/* OFFICE HOURS */}
      <div className="text-gray-500 mt-4">
        <div className="font-bold flex items-center">
          <img src={MeetingTimeIcon} alt="Email" className="w-4 h-4 mr-2" />
          Office Hours for this Course:
        </div>
        <ul className="list-none ml-4">
          {(officeHours.length > 0 &&
            officeHours.map((oh) => (
              <li key={oh.id}>
                {`${
                  oh.day.charAt(0).toUpperCase() + oh.day.slice(1)
                }, ${oh.start_time.slice(0, 5)} to ${oh.end_time.slice(0, 5)}`}
              </li>
            ))) || <li className="text-red-600">Not specified</li>}
        </ul>
      </div>
      {/* COURSES */}
      <div className="text-gray-500 mt-4">
        <div className="font-bold flex items-center">
          <img src={CoursesIcon} alt="Email" className="w-4 h-4 mr-2" />
          All Courses:
        </div>
        <ul className="list-none ml-4">
          {courses.map((course) => (
            <li key={course.id}>{`${course.code} - ${course.name}`}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default CourseInstructorCard;
