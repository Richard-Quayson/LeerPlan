import React, { useState } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { COURSE_ROUTINE_COLOURS } from "../utility/constants";

const localizer = momentLocalizer(moment);

const getCourseScheduleRange = (course) => {
  const startDate = moment(course.weekly_schedules[0].start_date).toDate();
  const endDate = moment(
    course.weekly_schedules[course.weekly_schedules.length - 1].end_date
  ).toDate();
  return { startDate, endDate };
};

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
  const [modalPosition, setModalPosition] = useState({ top: 0, left: 0 });

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
    const rect = e.target.getBoundingClientRect();
    setModalPosition({
      top: rect.top + window.scrollY,
      left: rect.left + window.scrollX,
    });
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
      fontSize: "14px",
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
          className="absolute bg-white shadow-lg rounded p-4"
          style={{
            top: modalPosition.top,
            left: modalPosition.left - 225,
            zIndex: 1000,
            width: "350px",
          }}
        >
          <button
            onClick={closeModal}
            className="absolute top-2 right-2 text-xl font-bold text-gray-400 hover:text-gray-600"
            aria-label="Close"
          >
            &times;
          </button>
          <h2 className="text-lg">{selectedEvent.title}</h2>
          <p>
            <strong>Start:</strong>{" "}
            {moment(selectedEvent.start).format("MMMM Do YYYY, h:mm a")}
          </p>
          <p>
            <strong>End:</strong>{" "}
            {moment(selectedEvent.end).format("MMMM Do YYYY, h:mm a")}
          </p>
          <p>
            <strong>Location:</strong> {selectedEvent.location}
          </p>
          {(() => {
            const weeklySchedule = filterWeeklySchedule(
              selectedEvent.courseCode,
              selectedEvent.courseTitle,
              selectedEvent.start
            );
            if (weeklySchedule) {
              return (
                <div>
                  <p>
                    <strong>Week:</strong> {weeklySchedule.weekNumber}
                  </p>
                  <p>
                    <strong>Date Range:</strong> {weeklySchedule.weekRange}
                  </p>
                  <p>
                    <strong>Type:</strong> {weeklySchedule.type}
                  </p>
                  {weeklySchedule.assessments.length > 0 && (
                    <div>
                      <strong>Assessments:</strong>
                      <ul>
                        {weeklySchedule.assessments.map((assessment, index) => (
                          <li key={index}>
                            {assessment.name} (Due: {assessment.due_date})
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {weeklySchedule.topics.length > 0 && (
                    <div>
                      <strong>Topics:</strong>
                      <ul>
                        {weeklySchedule.topics.map((topic, index) => (
                          <li key={index}>{topic.topic}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              );
            }
            return <p>No weekly schedule information available.</p>;
          })()}
        </div>
      )}
    </div>
  );
};

export default CustomCalendar;
