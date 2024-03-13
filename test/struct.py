from pydantic import BaseModel
from typing import List, Optional


class Semester(BaseModel):
    name: str
    year: int


class OfficeHour(BaseModel):
    day: str            # e.g. Monday
    start_time: str
    end_time: str


class Instructor(BaseModel):
    name: str
    email: str
    office_hours: List[OfficeHour]
    phone: Optional[str]


class LectureDay(BaseModel):
    day: str            # e.g. Monday
    start_time: str
    end_time: str
    location: str


class Course(BaseModel):
    code: str
    name: str
    description: str
    semester: Semester
    instructor: Instructor
    faculty_intern: Instructor
    lecture_days: List[LectureDay]
    # weekly_schedule: WeeklySchedule