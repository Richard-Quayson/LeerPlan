import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { COURSE_ROUTINE_COLOURS } from "../utility/constants";

const localizer = momentLocalizer(moment);

const getLastCourseEndDate = (courses) => {
  let latestEndDate = null;
  courses.forEach((course) => {
    course.course.lecture_days.forEach((lecture) => {
      const end = moment(
        `${lecture.day} ${lecture.end_time}`,
        "dddd HH:mm:ss"
      ).toDate();
      if (!latestEndDate || end > latestEndDate) {
        latestEndDate = end;
      }
    });
  });
  return latestEndDate;
};

const getColorForEvent = (index) => {
  const colors = Object.values(COURSE_ROUTINE_COLOURS);
  return colors[index % colors.length].light;
};

const CustomCalendar = ({ courses }) => {
  const events = courses.flatMap((course, courseIndex) => {
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
        color: getColorForEvent(courseIndex),
        repeating: {
          freq: "WEEKLY",
          until: getLastCourseEndDate(courses),
        },
      };
    });
  });

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
    <div className="h-full sans-serif text-sm">
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        views={["month", "week", "day"]}
        defaultView="week"
        style={{ height: "calc(100vh - 80px)" }}
        eventPropGetter={eventStyleGetter}
      />
    </div>
  );
};

export default CustomCalendar;
