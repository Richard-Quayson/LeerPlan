// ACCOUNT APP URLS //

// USER ACCOUNT MODEL URLS
export const REGISTER_USER_URL = "account/register/";                           // POST URL to register a new user

export const LOGIN_USER_URL = "account/login/";                                 // POST URL to login a user

export const LOGOUT_USER_URL = "account/logout/";                               // POST URL to logout a user

export const GENERATE_ACCESS_TOKEN_URL = "account/token/refresh/";              // POST URL to generate a new access token

export const USER_DETAILS_URL = "account/user/";                                // GET URL to get user details

export const UPDATE_USER_DETAILS_URL = "account/update/";                       // PATCH URL to update user details

// yet to integrate
export const CHANGE_PASSWORD_URL = "account/password/change/";                  // PATCH URL to change user password


// UNIVERSITY MODEL URLS
export const UNIVERSITY_LIST_URL = "account/universities/";                     // GET URL to get list of universities

// yet to integrate
export const UPDATE_UNIVERSITY_URL = "account/university/update/";              // PATCH URL to update university details
// export const UPDATE_UNIVERSITY_URL = "account/university/update/<int:university_id>/";  // PATCH URL to update university details


// USER UNIVERSITY MODEL URLS
export const ADD_USER_UNIVERSITY_URL = "account/user/university/add/";          // POST URL to add a university to user's list

export const REMOVE_USER_UNIVERSITY_URL = "account/user/university/remove/";    // DELETE URL to remove a university from user's list
// export const REMOVE_USER_UNIVERSITY_URL = "account/user/university/remove/<int:university_id>/";  // DELETE URL to remove a university from user's list

export const USER_UNIVERSITY_LIST_URL = "account/user/universities/";           // GET URL to get list of universities of a user


// USER ROUTINE MODEL URLS
export const ADD_USER_ROUTINE_URL = "account/user/routine/add/";                // POST URL to add a routine to user's list

// didn't need to integrate
export const USER_ROUTINE_DETAILS_URL = "account/user/routine/";                // GET URL to get routine details of a user
// export const USER_ROUTINE_DETAILS_URL = "account/user/routine/<int:routine_id>/";  // GET URL to get routine details of a user

// didn't need to integrate
export const USER_ROUTINE_LIST_URL = "account/user/routine/"                   // GET URL to get list of routines of a user

// yet to integrate
export const UPDATE_USER_ROUTINE_URL = "account/user/routine/update/";          // PATCH URL to update routine details of a user
// export const UPDATE_USER_ROUTINE_URL = "account/user/routine/update/<int:routine_id>/";  // PATCH URL to update routine details of a user

export const DELETE_USER_ROUTINE_URL = "account/user/routine/delete/";          // DELETE URL to delete a routine of a user
// export const DELETE_USER_ROUTINE_URL = "account/user/routine/delete/<int:routine_id>/";  // DELETE URL to delete a routine of a user