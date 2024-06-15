// access and refresh token keys
export const ACCESS_TOKEN = "access";
export const REFRESH_TOKEN = "refresh";


// name, email and password regex
NAME_REGEX = /^[a-zA-Z\- ]{2,}$/;
EMAIL_REGEX = /^[^0-9!@#$%^&*(+=)\\[\].></{}`]\w+([\.-_]?\w+)*@([a-z\d-]+)\.([a-z]{2,})(\.[a-z]{2,})?$/;
PASSWORD_REGEX = /^(?=(.*[A-Z]){1,})(?=(.*[a-z]){1,})(?=(.*\d){1,})(?=(.*[!#$%&()*+,-.:;<=>?@_~]){1,}).{8,}$/;


// user attribute constants
export const CURRENT_USER_ID = "CURRENT_USER_ID";