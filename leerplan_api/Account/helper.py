NAME_REGEX = r"^[a-zA-Z\- ]+{2,}$"

EMAIL_REGEX = r"^[^0-9!@#$%^&*(+=)\\[\].></{}`]\w+([\.-_]?\w+)*@([a-z\d-]+)\.([a-z]{2,})(\.[a-z]{2,})?$"

PASSWORD_REGEX = r"^(?=(.*[A-Z]){2,})(?=(.*[a-z]){2,})(?=(.*\d){2,})(?=(.*[!#$%&()*+,-.:;<=>?@_~]){2,}).{8,}$"

USERNAME_INDEX = 0      # username index in an email after splitting on the @


def profile_picture_upload_path(instance, filename: str) -> str:
    
    username = instance.email.split('@')[USERNAME_INDEX]
    return f"profile_picture/{username}_{filename}"