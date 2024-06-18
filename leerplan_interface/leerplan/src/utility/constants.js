// access and refresh token keys
export const ACCESS_TOKEN = "leerplan_access";
export const REFRESH_TOKEN = "leerplan_refresh";


// name, email and password regex
export const NAME_REGEX = /^[a-zA-Z\- ]{2,}$/;
export const EMAIL_REGEX = /^[^0-9!@#$%^&*(+=)\\[\].></{}`]\w+([\.-_]?\w+)*@([a-z\d-]+)\.([a-z]{2,})(\.[a-z]{2,})?$/;
export const PASSWORD_REGEX = /^(?=(.*[A-Z]){1,})(?=(.*[a-z]){1,})(?=(.*\d){1,})(?=(.*[!#$%&()*+,-.:;<=>?@_~]){1,}).{8,}$/;


// user attribute constants
export const CURRENT_USER_ID = "CURRENT_USER_ID";
export const PREFERRED_UNIVERSITY_NAME = "PREFERRED_UNIVERSITY_NAME";
export const PREFERRED_UNIVERSITY_ID = "PREFERRED_UNIVERSITY_ID";