import React from "react";
import moment from "moment";
import WeeklySchedule from "./WeeklySchedule";
import { COURSE_EVENT } from "../utility/constants";
import LocationIcon from "../assets/icons/Location.png";
import NotificationIcon from "../assets/icons/Notification.png";

const EventCard = ({ selectedEvent, closeModal, modalRef, courses }) => {
  console.log(selectedEvent);

  const getWeeklySchedule = (course, date) => {
    return course.weekly_schedules.find((schedule) =>
      moment(date).isBetween(schedule.start_date, schedule.end_date, null, "[]")
    );
  };

  const filterWeeklySchedule = (code, title, date) => {
    const courseObj = courses.find(
      (courseObj) =>
        courseObj.course.code === code && courseObj.course.name === title
    );
    if (courseObj) {
      const weeklySchedule = getWeeklySchedule(courseObj.course, date);
      if (weeklySchedule) {
        const weekStart = moment(weeklySchedule.start_date).format(
          "MMMM Do YYYY"
        );
        const weekEnd = moment(weeklySchedule.end_date).format("MMMM Do YYYY");
        return {
          weekRange: `${weekStart} to ${weekEnd}`,
          week_number: weeklySchedule.week_number,
          type: weeklySchedule.type,
          weekly_assessments: weeklySchedule.weekly_assessments,
          weekly_topics: weeklySchedule.weekly_topics,
          weekly_readings: weeklySchedule.weekly_readings,
        };
      }
    }
    return null;
  };

  return (
    <div
      className="absolute fit-content top-[200px] right-0 shadow-lg left-1/4 bottom-0 z-50 max-w-[500px] h-auto"
      onClick={(e) => e.stopPropagation()}
      ref={modalRef}
    >
      <div className="bg-white shadow-2xl rounded-lg p-6 w-full max-h-[600px] overflow-y-auto">
        <div className="flex justify-between items-center mb-1">
          <div className="flex items-center">
            <div
              className="w-4 h-4 rounded-sm mr-3"
              style={{ backgroundColor: selectedEvent.color }}
            ></div>
            <h2 className="text-lg font-bold">{selectedEvent.title}</h2>
          </div>
          <button
            onClick={closeModal}
            className="text-2xl font-bold text-gray-400 hover:text-gray-600"
            aria-label="Close"
          >
            &times;
          </button>
        </div>
        <div className="ml-6">
          <p className="mb-3">
            {moment(selectedEvent.start).format("dddd, MMMM DD, YYYY")}
            <span className="mx-2">|</span>
            {moment(selectedEvent.start).format("h:mm a")} -{" "}
            {moment(selectedEvent.end).format("h:mm a")}
          </p>
          {selectedEvent.type === "course" && (
            <div className="flex items-center mb-2">
              <img src={LocationIcon} alt="Location" className="w-5 h-5 mr-2" />
              <span>{selectedEvent.location}</span>
            </div>
          )}
          <div className="flex items-center mb-4">
            <img
              src={NotificationIcon}
              alt="Notification"
              className="w-5 h-5 mr-2"
            />
            <span>15 minutes before</span>
          </div>
        </div>

        {selectedEvent.type === COURSE_EVENT && (
          <>
            <hr className="my-4 border-gray-300" />
            {(() => {
              const weeklySchedule = filterWeeklySchedule(
                selectedEvent.courseCode,
                selectedEvent.courseTitle,
                selectedEvent.start
              );
              return <WeeklySchedule weeklySchedule={weeklySchedule} />;
            })()}
          </>
        )}
      </div>
    </div>
  );
};

export default EventCard;
