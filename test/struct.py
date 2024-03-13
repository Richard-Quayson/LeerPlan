from pydantic import BaseModel
from typing import List, Optional
from datetime import time

class Semester(BaseModel):
    name: str
    year: int

class TimeRange(BaseModel):
    start_time: time
    end_time: time

class OfficeHour(BaseModel):
    day: str            # e.g. Monday
    time: TimeRange

class Instructor(BaseModel):
    name: str
    email: str
    office_hours: List[OfficeHour]
    phone: Optional[str]

class LectureDay(BaseModel):
    day: str            # e.g. Monday
    time: TimeRange
    location: str

class WeeklySchedule(BaseModel):
    pass

class Course(BaseModel):
    code: str
    name: str
    description: str
    semester: Semester
    instructor: Instructor
    faculty_intern: Instructor
    lecture_days: List[LectureDay]
    weekly_schedule: WeeklySchedule