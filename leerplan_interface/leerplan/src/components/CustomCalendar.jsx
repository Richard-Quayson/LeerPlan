import React, { useState, useEffect, useRef } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import WeeklySchedule from "./WeeklySchedule";
import generateEvents from "./CalendarEvents";
import LocationIcon from "../assets/icons/Location.png";
import NotificationIcon from "../assets/icons/Notification.png";

const localizer = momentLocalizer(moment);

const CustomCalendar = ({
  courses,
  userRoutines,
  userMetadata,
  filterType,
  filterValue,
  applyFilter,
  resetFilter,
  displayTimeBlocks,
}) => {
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const modalRef = useRef(null);
  const [defaultDate, setDefaultDate] = useState(new Date());
  const [defaultView, setDefaultView] = useState("week");

  useEffect(() => {
    if (applyFilter && filterType && filterValue) {
      if (filterType === "date") {
        const selectedDate = moment(filterValue).toDate();
        setDefaultDate(selectedDate);
        setDefaultView("day");
      } else if (filterType === "courseCode") {
        const course = courses.find(
          (courseObj) => courseObj.course.code === filterValue
        );
        if (
          course &&
          course.course.weekly_schedules &&
          course.course.weekly_schedules.length > 0
        ) {
          const firstWeekStartDate = moment(
            course.course.weekly_schedules[0].start_date
          ).toDate();
          setDefaultDate(firstWeekStartDate);
          setDefaultView("week");
        }
      }
      resetFilter();
    }
  }, [applyFilter, filterType, filterValue, courses, resetFilter]);

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

  const handleEventClick = (event, e) => {
    e.stopPropagation();
    setSelectedEvent(event);
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setSelectedEvent(null);
  };

  const lectureEventStyleGetter = (event) => {
    const style = {
      backgroundColor: event.color, // CHANGE TO #3b82f6 LATER
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
        events={generateEvents(
          courses,
          userRoutines,
          userMetadata,
          displayTimeBlocks
        )}
        startAccessor="start"
        endAccessor="end"
        views={["month", "week", "day"]}
        defaultView={defaultView}
        style={{ height: "calc(100vh - 80px)" }}
        eventPropGetter={lectureEventStyleGetter}
        onSelectEvent={handleEventClick}
        date={defaultDate}
        onNavigate={(date) => setDefaultDate(date)}
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
              return <WeeklySchedule weeklySchedule={weeklySchedule} />;
            })()}
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomCalendar;
