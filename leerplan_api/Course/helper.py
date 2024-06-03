LECTURER = "lecturer"
FACULTY_INTERN = "faculty_intern"


def course_file_upload_path(instance, filename: str) -> str:
    """
    returns the file path for a course file
    """

    return f"courses/{instance.semester.university.name}/{instance.semester.name}_{instance.semester.year}/{instance.course.code}_{instance.course.name}.{filename.split('.')[-1]}"