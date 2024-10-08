import moment from "moment";
import {
  COURSE_ROUTINE_COLOURS,
  SLEEP_EVENT_COLOUR,
  TIME_BLOCK_EVENT_COLOUR,
  DAYS_OF_THE_WEEK,
  EVENT_BREAK,
  COURSE_EVENT,
  ROUTINE_EVENT,
  SLEEP_EVENT,
  TIME_BLOCK_EVENT,
} from "../utility/constants";

const getColorForCourseEvent = (index) => {
  const colors = Object.values(COURSE_ROUTINE_COLOURS);
  return colors[index % colors.length].deep;
};

const getColorForRoutineEvent = (index) => {
  const colors = Object.values(COURSE_ROUTINE_COLOURS);
  return colors[(colors.length - 1 - index) % colors.length].deep;
};

const generateEvents = (
  courses,
  userRoutines,
  userMetadata,
  displayTimeBlocks,
  timeBlocks
) => {
  const events = [];

  // Find global start and end dates
  const allStartDates = courses
    .flatMap((courseObj) =>
      courseObj.course.weekly_schedules.map((schedule) =>
        moment(schedule.start_date)
      )
    )
    .filter((date) => date.isValid());
  const allEndDates = courses
    .flatMap((courseObj) =>
      courseObj.course.weekly_schedules.map((schedule) =>
        moment(schedule.end_date)
      )
    )
    .filter((date) => date.isValid());

  if (allStartDates.length === 0 || allEndDates.length === 0) {
    return events;
  }

  const globalStartDate = moment.min(allStartDates);
  const globalEndDate = moment.max(allEndDates);

  // Generate course events
  courses.forEach((courseObj, courseIndex) => {
    const course = courseObj.course;
    const cohort = courseObj.cohort;

    cohort.lecture_days.forEach((lecture) => {
      let current = moment(globalStartDate).startOf("week");
      while (current.isSameOrBefore(globalEndDate)) {
        if (current.format("dddd").toLowerCase() === lecture.day) {
          const start = moment(current).set({
            hour: moment(lecture.start_time, "HH:mm:ss").get("hour"),
            minute: moment(lecture.start_time, "HH:mm:ss").get("minute"),
          });
          const end = moment(current).set({
            hour: moment(lecture.end_time, "HH:mm:ss").get("hour"),
            minute: moment(lecture.end_time, "HH:mm:ss").get("minute"),
          });

          // Find the weekly schedule for this event
          const weeklySchedule = course.weekly_schedules.find((schedule) =>
            start.isBetween(schedule.start_date, schedule.end_date, null, "[]")
          );

          events.push({
            type: COURSE_EVENT,
            title: `${course.code} ${course.name}`,
            start: start.toDate(),
            end: end.toDate(),
            allDay: false,
            courseCode: course.code,
            courseTitle: course.name,
            location: lecture.location,
            color: getColorForCourseEvent(courseIndex),
            notification: moment(start).subtract(15, "minutes").toDate(), // Add notification 15 minutes before
            weeklySchedule: weeklySchedule
              ? {
                  weekRange: `${moment(weeklySchedule.start_date).format(
                    "MMMM Do YYYY"
                  )} to ${moment(weeklySchedule.end_date).format(
                    "MMMM Do YYYY"
                  )}`,
                  week_number: weeklySchedule.week_number,
                  type: weeklySchedule.type,
                  weekly_assessments: weeklySchedule.weekly_assessments,
                  weekly_topics: weeklySchedule.weekly_topics,
                  weekly_readings: weeklySchedule.weekly_readings,
                }
              : null,
          });
        }
        current.add(1, "day");
      }
    });
  });

  // Generate user routine events
  userRoutines.forEach((routine) => {
    let current = moment(globalStartDate).startOf("week");
    while (current.isSameOrBefore(globalEndDate)) {
      if (current.format("dddd").toLowerCase() === routine.day) {
        const start = moment(current).set({
          hour: moment(routine.start_time, "HH:mm:ss").get("hour"),
          minute: moment(routine.start_time, "HH:mm:ss").get("minute"),
        });
        const end = moment(current).set({
          hour: moment(routine.end_time, "HH:mm:ss").get("hour"),
          minute: moment(routine.end_time, "HH:mm:ss").get("minute"),
        });

        events.push({
          type: ROUTINE_EVENT,
          title: routine.name,
          start: start.toDate(),
          end: end.toDate(),
          allDay: false,
          isRoutine: true,
          color: getColorForRoutineEvent(routine.routine_index),
        });
      }
      current.add(1, "day");
    }
  });

  // Generate sleep events from user metadata
  let sleepTime = userMetadata.sleep_time;
  // Adjust sleep time if necessary
  if (sleepTime === "23:59:59" || sleepTime === "23:59") {
    sleepTime = "00:00:00";
  }

  const sleepMoment = moment(sleepTime, "HH:mm:ss");
  const wakeMoment = moment(userMetadata.wake_time, "HH:mm:ss");

  DAYS_OF_THE_WEEK.forEach((day) => {
    let current = moment(globalStartDate).startOf("week");
    while (current.isSameOrBefore(globalEndDate)) {
      const start = moment(current)
        .day(day)
        .set({
          hour: sleepMoment.get("hour"),
          minute: sleepMoment.get("minute"),
        });
      const end = moment(current)
        .day(day)
        .set({
          hour: wakeMoment.get("hour"),
          minute: wakeMoment.get("minute"),
        });

      events.push({
        type: SLEEP_EVENT,
        title: "Bed Time",
        start: start.toDate(),
        end: end.toDate(),
        allDay: false,
        color: SLEEP_EVENT_COLOUR,
      });

      current.add(1, "week");
    }
  });

  // Generate time block events for all days
  if (displayTimeBlocks && timeBlocks) {
    DAYS_OF_THE_WEEK.forEach((day) => {
      if (timeBlocks[day]) {
        timeBlocks[day].forEach((block) => {
          const start = moment(block.start_time, "HH:mm:ss");
          const end = moment(block.end_time, "HH:mm:ss");
          if (end.diff(start, "minutes") >= 20) {
            let current = moment(globalStartDate).startOf("week");
            while (current.isSameOrBefore(globalEndDate)) {
              if (current.format("dddd").toLowerCase() === day) {
                const eventStart = moment(current)
                  .set({
                    hour: start.get("hour"),
                    minute: start.get("minute") + EVENT_BREAK,
                  })
                  .toDate();
                const eventEnd = moment(current)
                  .set({
                    hour: end.get("hour"),
                    minute: end.get("minute") - EVENT_BREAK,
                  })
                  .toDate();

                events.push({
                  type: TIME_BLOCK_EVENT,
                  title: block.label,
                  start: eventStart,
                  end: eventEnd,
                  allDay: false,
                  color: TIME_BLOCK_EVENT_COLOUR,
                });
              }
              current.add(1, "day");
            }
          }
        });
      }
    });
  }

  return events;
};

export default generateEvents;
