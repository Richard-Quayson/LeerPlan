import React, { useState, useEffect, useRef } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { COURSE_ROUTINE_COLOURS } from "../utility/constants";
import LocationIcon from "../assets/icons/Location.png";
import NotificationIcon from "../assets/icons/Notification.png";
import HashTagIcon from "../assets/icons/HashTag.png";
import AssessmentIcon from "../assets/icons/Assessment.png";
import TopicIcon from "../assets/icons/Topic.png";
import ReadingIcon from "../assets/icons/Reading.png";

const localizer = momentLocalizer(moment);

const getColorForEvent = (index) => {
  const colors = Object.values(COURSE_ROUTINE_COLOURS);
  return colors[index % colors.length].light;
};

const generateEvents = (course, courseIndex) => {
  const events = [];
  const weeklySchedules = course.weekly_schedules;

  if (weeklySchedules.length === 0) return events;

  const startDate = moment(weeklySchedules[0].start_date);
  const endDate = moment(weeklySchedules[weeklySchedules.length - 1].end_date);

  course.lecture_days.forEach((lecture) => {
    let current = moment(startDate).startOf("week");
    while (current.isSameOrBefore(endDate)) {
      if (current.format("dddd").toLowerCase() === lecture.day) {
        const start = moment(current).set({
          hour: moment(lecture.start_time, "HH:mm:ss").get("hour"),
          minute: moment(lecture.start_time, "HH:mm:ss").get("minute"),
        });
        const end = moment(current).set({
          hour: moment(lecture.end_time, "HH:mm:ss").get("hour"),
          minute: moment(lecture.end_time, "HH:mm:ss").get("minute"),
        });

        events.push({
          title: `${course.code} ${course.name}`,
          start: start.toDate(),
          end: end.toDate(),
          allDay: false,
          color: getColorForEvent(courseIndex),
          courseCode: course.code,
          courseTitle: course.name,
          location: lecture.location,
        });
      }
      current.add(1, "day");
    }
  });

  return events;
};

const CustomCalendar = ({ courses }) => {
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const modalRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        closeModal();
      }
    };

    if (modalIsOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [modalIsOpen]);

  const events = courses.flatMap((courseObj, courseIndex) =>
    generateEvents(courseObj.course, courseIndex)
  );

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
          weekNumber: weeklySchedule.week_number,
          type: weeklySchedule.type,
          assessments: weeklySchedule.weekly_assessments,
          topics: weeklySchedule.weekly_topics,
        };
      }
    }
    return null;
  };

  const handleEventClick = (event, e) => {
    e.stopPropagation();
    setSelectedEvent(event);
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setSelectedEvent(null);
  };

  const eventStyleGetter = (event) => {
    const style = {
      backgroundColor: event.color,
      borderRadius: "5px",
      color: "white",
      border: "0px",
      display: "block",
      fontSize: "12px",
      fontWeight: "bold",
      fontFamily: "sans-serif",
    };
    return {
      style,
    };
  };

  return (
    <div className="h-full sans-serif text-sm relative">
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        views={["month", "week", "day"]}
        defaultView="week"
        style={{ height: "calc(100vh - 80px)" }}
        eventPropGetter={eventStyleGetter}
        onSelectEvent={handleEventClick}
        defaultDate={new Date()}
      />

      {modalIsOpen && selectedEvent && (
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
              <div className="flex items-center mb-2">
                <img
                  src={LocationIcon}
                  alt="Location"
                  className="w-5 h-5 mr-2"
                />
                <span>{selectedEvent.location}</span>
              </div>
              <div className="flex items-center mb-4">
                <img
                  src={NotificationIcon}
                  alt="Notification"
                  className="w-5 h-5 mr-2"
                />
                <span>15 minutes before</span>
              </div>
            </div>
            <hr className="my-4 border-gray-300" />
            {(() => {
              const weeklySchedule = filterWeeklySchedule(
                selectedEvent.courseCode,
                selectedEvent.courseTitle,
                selectedEvent.start
              );
              if (weeklySchedule) {
                return (
                  <div>
                    <div className="flex items-center mb-3">
                      <img
                        src={HashTagIcon}
                        alt="Week"
                        className="w-5 h-5 mr-2"
                      />
                      <div className="flex items-center">
                        <span className="border border-gray-300 rounded px-2 py-1 mr-2">
                          Week {weeklySchedule.weekNumber}
                        </span>
                        <span className="bg-yellow-100 font-semibold text-yellow-800 px-2 py-1 rounded">
                          {weeklySchedule.type}
                        </span>
                      </div>
                    </div>
                    {weeklySchedule.assessments.length > 0 && (
                      <div className="mb-3">
                        <div className="flex items-center mb-2">
                          <img
                            src={AssessmentIcon}
                            alt="Assessments"
                            className="w-5 h-5 mr-2"
                          />
                          <strong>Assessments</strong>
                        </div>
                        <div className="pl-8">
                          {weeklySchedule.assessments.map(
                            (assessment, index) => (
                              <div
                                key={index}
                                className="flex justify-between mb-1"
                              >
                                <span className="mr-2">{assessment.name}</span>
                                <span className="font-semibold">
                                  Due:{" "}
                                  <span className="text-red-600">
                                    {assessment.due_date
                                      ? moment(assessment.due_date).format(
                                          "MMMM DD"
                                        )
                                      : "No specified date"}
                                  </span>
                                </span>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    )}
                    {weeklySchedule.topics.length > 0 && (
                      <div className="mb-3">
                        <div className="flex items-center mb-2">
                          <img
                            src={TopicIcon}
                            alt="Topics"
                            className="w-5 h-5 mr-2"
                          />
                          <strong>Topics</strong>
                        </div>
                        <ul className="list-none pl-8">
                          {weeklySchedule.topics.map((topic, index) => (
                            <li key={index}>{topic.topic}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {weeklySchedule.readings &&
                      weeklySchedule.readings.length > 0 && (
                        <div className="mb-3">
                          <div className="flex items-center mb-2">
                            <img
                              src={ReadingIcon}
                              alt="Readings"
                              className="w-5 h-5 mr-2"
                            />
                            <strong>Readings</strong>
                          </div>
                          <ul className="list-none pl-8">
                            {weeklySchedule.readings.map((reading, index) => (
                              <li key={index}>{reading.title}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                  </div>
                );
              }
              return (
                <p className="text-center text-gray-500">
                  No weekly schedule information available.
                </p>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomCalendar;
