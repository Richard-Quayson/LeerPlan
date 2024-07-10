// access and refresh token keys
export const ACCESS_TOKEN = "leerplan:ACCESS_TOKEN";
export const REFRESH_TOKEN = "leerplan:REFRESH_TOKEN";

// name, email and password regex
export const NAME_REGEX = /^[a-zA-Z\- ]{2,}$/;
export const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
export const PASSWORD_REGEX = /^(?=(.*[A-Z]){1,})(?=(.*[a-z]){1,})(?=(.*\d){1,})(?=(.*[!#$%&()*+,-.:;<=>?@_~]){1,}).{8,}$/;
export const TIME_REGEX = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
export const EXTENDED_TIME_REGEX = /^([01]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/;
export const STUDY_TIME_REGEX = /^\d+(\.\d+)?$/;

// user preferences
export const CURRENT_USER_ID = "leerplan:CURRENT_USER_ID";
export const PREFERRED_UNIVERSITY_NAME = "leerplan:PREFERRED_UNIVERSITY_NAME";
export const PREFERRED_UNIVERSITY_ID = "leerplan:PREFERRED_UNIVERSITY_ID";
export const EXTENDED_COURSE_LIST_DISPLAY = "leerplan:EXTENDED_COURSE_LIST_DISPLAY";
export const EXTENDED_ROUTINE_LIST_DISPLAY = "leerplan:EXTENDED_ROUTINE_LIST_DISPLAY";
export const EXTENDED_CALENDAR_FILTER_DISPLAY = "leerplan:EXTENDED_CALENDAR_FILTER_DISPLAY";
export const CALENDAR_FILTER_TYPE = "leerplan:CALENDAR_FILTER_TYPE";
export const CALENDAR_FILTER_VALUE = "leerplan:CALENDAR_FILTER_VALUE";
export const DISPLAY_TIME_BLOCKS = "leerplan:DISPLAY_TIME_BLOCKS";

// event break
export const EVENT_BREAK = 15;

// instructor types
export const INSTRUCTOR_TYPES = {
  Lecturer: "Lecturer",
  "Faculty Intern": "Faculty Intern / Teaching Assistant",
}

// days of the week
export const DAYS_OF_THE_WEEK = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
];

// sleep event background colour
export const SLEEP_EVENT_COLOUR = "#86198f";

// time block event background colour
export const TIME_BLOCK_EVENT_COLOUR = "#22c55e";

// course and routine colour list (list of dictionary objects)
export const COURSE_ROUTINE_COLOURS = {
  red: {
    deep: "#ef4444",
    light: "#fca5a5",
  },
  orange: {
    deep: "#f97316",
    light: "#fdba74",
  },
  slate: {
    deep: "#475569",
    light: "#cbd5e1",
  },
  purple: {
    deep: "#a855f7",
    light: "#d8b4fe",
  },
  lime: {
    deep: "#84cc16",
    light: "#bef264",
  },
  cyan: {
    deep: "#06b6d4",
    light: "#67e8f9",
  },
  pink: {
    deep: "#ec4899",
    light: "#f9a8d4",
  },
  bluish: {
    deep: "#3174ad",
    light: "#93c5fd",
  },
  amber: {
    deep: "#f59e0b",
    light: "#fcd34d",
  }
};
