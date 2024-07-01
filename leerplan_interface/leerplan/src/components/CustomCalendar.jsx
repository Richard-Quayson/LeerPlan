import React from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";

const localizer = momentLocalizer(moment);

const CustomCalendar = ({ courses }) => {
  const events = courses.flatMap((course) => {
    return course.course.lecture_days.map((lecture) => {
      const start = moment(
        `${lecture.day} ${lecture.start_time}`,
        "dddd HH:mm:ss"
      ).toDate();
      const end = moment(
        `${lecture.day} ${lecture.end_time}`,
        "dddd HH:mm:ss"
      ).toDate();

      return {
        title: course.course.name,
        start,
        end,
        allDay: false,
        repeating: {
          freq: "WEEKLY",
          until: new Date(2022, 4, 29),
        },
      };
    });
  });

  const eventStyleGetter = (event) => {
    const backgroundColor = event.color;
    const style = {
      backgroundColor,
      borderRadius: "5px",
      opacity: 0.8,
      color: "white",
      border: "0px",
      display: "block",
    };
    return {
      style,
    };
  };

  return (
    <div className="h-full">
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: "calc(100vh - 80px)" }}
        eventPropGetter={eventStyleGetter}
      />
    </div>
  );
};

export default CustomCalendar;
