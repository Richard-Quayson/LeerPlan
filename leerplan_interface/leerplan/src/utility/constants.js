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