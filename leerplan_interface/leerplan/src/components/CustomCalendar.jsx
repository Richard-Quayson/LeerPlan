import React, { useState } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { COURSE_ROUTINE_COLOURS } from '../utility/constants';

const localizer = momentLocalizer(moment);

const getLastCourseEndDate = (courses) => {
  let latestEndDate = null;
  courses.forEach((course) => {
    course.course.lecture_days.forEach((lecture) => {
      const end = moment(`${lecture.day} ${lecture.end_time}`, 'dddd HH:mm:ss').toDate();
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
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [modalPosition, setModalPosition] = useState({ top: 0, left: 0 });

  const events = courses.flatMap((course, courseIndex) => {
    return course.course.lecture_days.map((lecture) => {
      const start = moment(`${lecture.day} ${lecture.start_time}`, 'dddd HH:mm:ss').toDate();
      const end = moment(`${lecture.day} ${lecture.end_time}`, 'dddd HH:mm:ss').toDate();

      return {
        title: course.course.code + " " + course.course.name,
        start,
        end,
        allDay: false,
        color: getColorForEvent(courseIndex),
        repeating: {
          freq: 'WEEKLY',
          until: getLastCourseEndDate(courses),
        },
        courseCode: course.course.code,
        courseTitle: course.course.name,
      };
    });
  });

  const eventStyleGetter = (event) => {
    const style = {
      backgroundColor: event.color,
      borderRadius: '5px',
      color: 'white',
      border: '0px',
      display: 'block',
      fontSize: '14px',
      fontWeight: 'bold',
      fontFamily: 'sans-serif',
    };
    return {
      style,
    };
  };

  const handleEventClick = (event, e) => {
    const rect = e.target.getBoundingClientRect();
    setModalPosition({ top: rect.top + window.scrollY, left: rect.left + window.scrollX });
    setSelectedEvent(event);
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setSelectedEvent(null);
  };

  const filterCourse = (code, title) => {
    const filteredEvent = events.find((event) => event.courseCode === code && event.courseTitle === title);
    if (filteredEvent) {
      const weekStart = moment(filteredEvent.start).startOf('week').format('MMMM Do YYYY');
      const weekEnd = moment(filteredEvent.start).endOf('week').format('MMMM Do YYYY');
      console.log(filteredEvent);
      return `Event falls in the week of ${weekStart} to ${weekEnd}`;
    }
    return 'Event not found';
  };

  return (
    <div className="h-full sans-serif text-sm relative">
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        views={['month', 'week', 'day']}
        defaultView="week"
        style={{ height: 'calc(100vh - 80px)' }}
        eventPropGetter={eventStyleGetter}
        onSelectEvent={handleEventClick}
      />

      {modalIsOpen && selectedEvent && (
        <div
          className="absolute bg-white shadow-lg rounded p-4"
          style={{ top: modalPosition.top, left: modalPosition.left - 225, zIndex: 1000, width: '350px' }}
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
            <strong>Start:</strong> {moment(selectedEvent.start).format('MMMM Do YYYY, h:mm:ss a')}
          </p>
          <p>
            <strong>End:</strong> {moment(selectedEvent.end).format('MMMM Do YYYY, h:mm:ss a')}
          </p>
          <p>{filterCourse(selectedEvent.courseCode, selectedEvent.courseTitle)}</p>
          {/* Add more event details here if necessary */}
        </div>
      )}
    </div>
  );
};

export default CustomCalendar;

// import React, { useState } from 'react';
// import { Calendar, momentLocalizer } from 'react-big-calendar';
// import moment from 'moment';
// import 'react-big-calendar/lib/css/react-big-calendar.css';
// import { COURSE_ROUTINE_COLOURS } from '../utility/constants';

// const localizer = momentLocalizer(moment);

// const getLastCourseEndDate = (courses) => {
//   let latestEndDate = null;
//   courses.forEach((course) => {
//     course.course.lecture_days.forEach((lecture) => {
//       const end = moment(`${lecture.day} ${lecture.end_time}`, 'dddd HH:mm:ss').toDate();
//       if (!latestEndDate || end > latestEndDate) {
//         latestEndDate = end;
//       }
//     });
//   });
//   return latestEndDate;
// };

// const getColorForEvent = (index) => {
//   const colors = Object.values(COURSE_ROUTINE_COLOURS);
//   return colors[index % colors.length].light;
// };

// const CustomCalendar = ({ courses }) => {
//   const [modalIsOpen, setModalIsOpen] = useState(false);
//   const [selectedEvent, setSelectedEvent] = useState(null);
//   const [modalPosition, setModalPosition] = useState({ top: 0, left: 0 });

//   const events = courses.flatMap((course, courseIndex) => {
//     return course.course.lecture_days.map((lecture) => {
//       const start = moment(`${lecture.day} ${lecture.start_time}`, 'dddd HH:mm:ss').toDate();
//       const end = moment(`${lecture.day} ${lecture.end_time}`, 'dddd HH:mm:ss').toDate();

//       return {
//         title: course.course.code + " " + course.course.name,
//         start,
//         end,
//         allDay: false,
//         color: getColorForEvent(courseIndex),
//         repeating: {
//           freq: 'WEEKLY',
//           until: getLastCourseEndDate(courses),
//         },
//       };
//     });
//   });

//   const eventStyleGetter = (event) => {
//     const style = {
//       backgroundColor: event.color,
//       borderRadius: '5px',
//       color: 'white',
//       border: '0px',
//       display: 'block',
//       fontSize: '14px',
//       fontWeight: 'bold',
//       fontFamily: 'sans-serif',
//     };
//     return {
//       style,
//     };
//   };

//   const handleEventClick = (event, e) => {
//     const rect = e.target.getBoundingClientRect();
//     setModalPosition({ top: rect.top + window.scrollY, left: rect.left + window.scrollX });
//     setSelectedEvent(event);
//     setModalIsOpen(true);
//   };

//   const closeModal = () => {
//     setModalIsOpen(false);
//     setSelectedEvent(null);
//   };

//   return (
//     <div className="h-full sans-serif text-sm relative">
//       <Calendar
//         localizer={localizer}
//         events={events}
//         startAccessor="start"
//         endAccessor="end"
//         views={['month', 'week', 'day']}
//         defaultView="week"
//         style={{ height: 'calc(100vh - 80px)' }}
//         eventPropGetter={eventStyleGetter}
//         onSelectEvent={handleEventClick}
//       />

//       {modalIsOpen && selectedEvent && (
//         <div
//           className="absolute bg-white shadow-lg rounded p-4"
//           style={{ top: modalPosition.top, left: modalPosition.left - 225, zIndex: 1000, width: '350px' }}
//         >
//           <button
//             onClick={closeModal}
//             className="absolute top-2 right-2 text-xl font-bold text-gray-400 hover:text-gray-600"
//             aria-label="Close"
//           >
//             &times;
//           </button>
//           <h2 className="text-lg">{selectedEvent.title}</h2>
//           <p>
//             <strong>Start:</strong> {moment(selectedEvent.start).format('MMMM Do YYYY, h:mm:ss a')}
//           </p>
//           <p>
//             <strong>End:</strong> {moment(selectedEvent.end).format('MMMM Do YYYY, h:mm:ss a')}
//           </p>
//           {/* Add more event details here if necessary */}
//         </div>
//       )}
//     </div>
//   );
// };

// export default CustomCalendar;
