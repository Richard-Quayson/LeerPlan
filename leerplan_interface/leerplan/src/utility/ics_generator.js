import { createEvents } from "ics";
import moment from "moment";
import { COURSE_EVENT } from "./constants";

export const generateICSFile = (events) => {
  const icsEvents = events.map((event) => {
    const start = moment(event.start);
    const end = moment(event.end);

    let description = "";
    if (event.type === COURSE_EVENT) {
      description = `Course: ${event.courseCode} ${event.courseTitle}\nLocation: ${event.location}`;

      if (event.weeklySchedule) {
        description += `\n\nWeek ${event.weeklySchedule.week_number} - ${event.weeklySchedule.type}`;

        if (event.weeklySchedule.weekly_assessments.length > 0) {
          description += "\n\nAssessments:";
          event.weeklySchedule.weekly_assessments.forEach((assessment) => {
            description += `\n- ${assessment.name} (Due: ${moment(
              assessment.due_date
            ).format("MMMM DD")})`;
          });
        }

        if (event.weeklySchedule.weekly_topics.length > 0) {
          description += "\n\nTopics:";
          event.weeklySchedule.weekly_topics.forEach((topic) => {
            description += `\n- ${topic.topic}`;
          });
        }

        if (event.weeklySchedule.weekly_readings.length > 0) {
          description += "\n\nReadings:";
          event.weeklySchedule.weekly_readings.forEach((reading) => {
            description += `\n- ${reading.chapter}`;
          });
        }
      }
    }

    return {
      title: event.title,
      description,
      start: [
        start.year(),
        start.month() + 1,
        start.date(),
        start.hour(),
        start.minute(),
      ],
      end: [end.year(), end.month() + 1, end.date(), end.hour(), end.minute()],
      location: event.location || "",
      alarms: [{ action: "display", trigger: { minutes: 15, before: true } }],
    };
  });

  const { error, value } = createEvents(icsEvents);

  if (error) {
    console.error(error);
    return null;
  }

  return value;
};
