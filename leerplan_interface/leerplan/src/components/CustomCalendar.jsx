import React, {
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle,
  useRef,
} from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import EventCard from "./EventCard";
import generateEvents from "./CalendarEvents";
import api from "../utility/api";
import { GENERATE_TIME_BLOCKS_URL } from "../utility/api_urls";

const localizer = momentLocalizer(moment);

const CustomCalendar = forwardRef(
  (
    {
      courses,
      userRoutines,
      userMetadata,
      filterType,
      filterValue,
      applyFilter,
      resetFilter,
      displayTimeBlocks,
    },
    ref
  ) => {
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [defaultDate, setDefaultDate] = useState(new Date());
    const [defaultView, setDefaultView] = useState("week");
    const [timeBlocks, setTimeBlocks] = useState({});
    const [events, setEvents] = useState([]);
    const modalRef = useRef(null);

    useEffect(() => {
      const fetchTimeBlocks = async () => {
        try {
          const response = await api.get(GENERATE_TIME_BLOCKS_URL);
          setTimeBlocks(response.data);
        } catch (error) {
          console.error("Failed to fetch time blocks:", error);
          setTimeBlocks({});
        }
      };

      fetchTimeBlocks();
    }, []);

    useEffect(() => {
      const generatedEvents = generateEvents(
        courses,
        userRoutines,
        userMetadata,
        displayTimeBlocks,
        timeBlocks
      );
      setEvents(generatedEvents);
    }, [courses, userRoutines, userMetadata, displayTimeBlocks, timeBlocks]);

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

    useImperativeHandle(ref, () => ({
      getEvents: () => events,
    }));

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
          defaultView={defaultView}
          style={{ height: "calc(100vh - 80px)" }}
          eventPropGetter={lectureEventStyleGetter}
          onSelectEvent={handleEventClick}
          date={defaultDate}
          onNavigate={(date) => setDefaultDate(date)}
        />

        {modalIsOpen && selectedEvent && (
          <EventCard
            selectedEvent={selectedEvent}
            closeModal={closeModal}
            modalRef={modalRef}
          />
        )}
      </div>
    );
  }
);

export default CustomCalendar;
