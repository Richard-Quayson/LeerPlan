from pydantic import BaseModel, PositiveInt, PositiveFloat
from typing import List, Optional
from datetime import time, date

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

class Textbook(BaseModel):
    title: str
    type: Optional[str]

class EvaluationCriteria(BaseModel):
    type: str
    weight: PositiveFloat

class LectureDay(BaseModel):
    day: str            # e.g. Monday
    time: TimeRange
    location: str

class Topic(BaseModel):
    title: str

class Chapter(BaseModel):
    chapter: str

class Assessment(BaseModel):
    name: str
    due_date: Optional[date]
    weight: Optional[float]

class Week(BaseModel):
    week_number: PositiveInt
    start_date: Optional[date]
    end_date: Optional[date]
    type: str
    topics: List[Topic]
    reading: List[Chapter]
    assessments: Optional[List[Assessment]]

class WeeklySchedule(BaseModel):
    weeks: list[Week]
    pass

class Course(BaseModel):
    code: str
    name: str
    description: str
    semester: Semester
    instructor: Instructor
    faculty_intern: Instructor
    textbooks: List[Textbook]
    evaluation_criteria: List[EvaluationCriteria]
    lecture_days: List[LectureDay]
    weekly_schedule: WeeklySchedule