from datetime import datetime

NAME_REGEX = r"^[a-zA-Z\-., ]{2,}$"

EMAIL_REGEX = r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"

PASSWORD_REGEX = r"^(?=(.*[A-Z]){1,})(?=(.*[a-z]){1,})(?=(.*\d){1,})(?=(.*[!#$%&()*+,-.:;<=>?@_~]){1,}).{8,}$"

USERNAME_INDEX = 0      # username index in an email after splitting on the @

DAYS_ABBREVIATION = ["M", "T", "W", "Th", "F", "Sa", "Su"]

DAYS_DICT = {
    "M": "Monday",
    "T": "Tuesday",
    "W": "Wednesday",
    "Th": "Thursday",
    "F": "Friday",
    "Sa": "Saturday",
    "Su": "Sunday"
}


def profile_picture_upload_path(instance, filename: str) -> str:
    """
    Returns the path where the profile picture will be stored
    """
    
    username = instance.email.split('@')[USERNAME_INDEX]
    return f"profile_picture/{username}_{filename}"


def adjust_time(time: str) -> str:
    """
    Adjusts the time 00:00:00 to 23:59:59 to make time comparison easier
    """

    if time == datetime.strptime("00:00:00", "%H:%M:%S").time():
            time = datetime.strptime("23:59:59", "%H:%M:%S").time()

    return time


def get_extended_routine_data(routines: list[dict]) -> list[dict]:
    """
    Extends routine data to include routine data for specified routine days
    """

    extended_routine = list()
    routine_index = 0
    for routine in routines:
        routine_days = routine["days"].split(",")

        for day in routine_days:
            extended_routine.append({
                "id": routine["id"],
                "user": routine["user"],
                "name": routine["name"],
                "start_time": routine["start_time"],
                "end_time": routine["end_time"],
                "day": DAYS_DICT[day].lower(),
                "routine_index": routine_index
            })

        routine_index += 1

    return extended_routine