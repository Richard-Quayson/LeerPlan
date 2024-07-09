from datetime import datetime

NAME_REGEX = r"^[a-zA-Z\-., ]{2,}$"

EMAIL_REGEX = r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"

PASSWORD_REGEX = r"^(?=(.*[A-Z]){1,})(?=(.*[a-z]){1,})(?=(.*\d){1,})(?=(.*[!#$%&()*+,-.:;<=>?@_~]){1,}).{8,}$"

USERNAME_INDEX = 0      # username index in an email after splitting on the @

DAYS_ABBREVIATION = ["M", "T", "W", "Th", "F", "Sa", "Su"]


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