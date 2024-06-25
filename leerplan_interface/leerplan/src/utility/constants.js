// access and refresh token keys
export const ACCESS_TOKEN = "leerplan:ACCESS_TOKEN";
export const REFRESH_TOKEN = "leerplan:REFRESH_TOKEN";

// name, email and password regex
export const NAME_REGEX = /^[a-zA-Z\- ]{2,}$/;
export const EMAIL_REGEX = /^[^0-9!@#$%^&*(+=)\\[\].></{}`]\w+([\.-_]?\w+)*@([a-z\d-]+)\.([a-z]{2,})(\.[a-z]{2,})?$/;
export const PASSWORD_REGEX = /^(?=(.*[A-Z]){1,})(?=(.*[a-z]){1,})(?=(.*\d){1,})(?=(.*[!#$%&()*+,-.:;<=>?@_~]){1,}).{8,}$/;

// user attribute constants
export const CURRENT_USER_ID = "leerplan:CURRENT_USER_ID";
export const PREFERRED_UNIVERSITY_NAME = "leerplan:PREFERRED_UNIVERSITY_NAME";
export const PREFERRED_UNIVERSITY_ID = "leerplan:PREFERRED_UNIVERSITY_ID";
export const EXTENDED_COURSE_LIST_DISPLAY = "leerplan:EXTENDED_COURSE_LIST_DISPLAY";
export const EXTENDED_ROUTINE_LIST_DISPLAY = "leerplan:EXTENDED_ROUTINE_LIST_DISPLAY";

// course colour list (list of dictionary objects)
export const COURSE_COLOURS = {
  red: {
    deep: "#dc2626",
    light: "#fca5a5",
  },
  slate: {
    deep: "#475569",
    light: "#cbd5e1",
  },
  orange: {
    deep: "#ea580c",
    light: "#fdba74",
  },
  amber: {
    deep: "#d97706",
    light: "#fcd34d",
  },
  lime: {
    deep: "#65a30d",
    light: "#bef264",
  },
  green: {
    deep: "#16a34a",
    light: "#86efac",
  },
  teal: {
    deep: "#0d9488",
    light: "#5eead4",
  },
  blue: {
    deep: "#2563eb",
    light: "#93c5fd",
  },
  purple: {
    deep: "#9333ea",
    light: "#d8b4fe",
  },
  pink: {
    deep: "#db2777",
    light: "#f9a8d4",
  },
  rose: {
    deep: "#e11d48",
    light: "#fda4af",
  },
};
