from pydantic import BaseModel, PositiveInt, PositiveFloat
from typing import List, Optional
from datetime import time, date


class Semester(BaseModel):
    """
    defines a Semester object

    Attributes:
        - name (str): the name of the semester (e.g. Fall, Spring, Summer)
        - year (int): the year of the semester (e.g. 2024, 2025, 2026)
    """

    name: str
    year: int


class TimeRange(BaseModel):
    """
    defines the start and end time of a time range

    Attributes:
        - start_time (time): the start time of the time range (e.g. 02:00:00, 13:00:00)
        - end_time (time): the end time of the time range (e.g. 10:00:00, 15:00:00)
    """

    start_time: time
    end_time: time


class OfficeHour(BaseModel):
    """
    defines the day and time range for an office hour session

    Attributes:
        - day (str): the day of the week (e.g. Monday, Tuesday, Wednesday)
        - time (TimeRange): the time range for the office hour (e.g. 02:00:00 - 10:00:00, 13:00:00 - 15:00:00)
    """

    day: str
    time: TimeRange


class Instructor(BaseModel):
    """
    defines the details of an instructor for a course

    Attributes:
        - name (str): the name of the instructor (e.g. John Doe, Jane Smith)
        - email (str): the email of the instructor (e.g. john.doe@ashesi.edu.gh, jane.smith@ashesi.edu.gh)
        - office_hours (List[OfficeHour]): the office hours of the instructor (e.g. [OfficeHour, OfficeHour, ...])
        - phone (Optional[str]): the phone number of the instructor (e.g. +233 123 456 789, +233 987 654 321)
    """

    name: str
    email: str
    office_hours: List[OfficeHour]
    phone: Optional[str]


class Textbook(BaseModel):
    """
    defines the title and type of a Course textbook

    Attributes:
        - title (str): the title of the textbook (e.g. Introduction to Computing, Data Structures and Algorithms)
        - type (Optional[str]): the type of the textbook (e.g. primary, secondary)
    """

    title: str
    type: Optional[str]


class EvaluationCriteria(BaseModel):
    """
    defines the type and weight of an evaluation criteria for a course

    Attributes:
        - type (str): the type of the evaluation criteria (e.g. quiz, lab, midsem)
        - weight (PositiveFloat): the weight of the evaluation criteria (e.g. 15, 20)
    """

    type: str
    weight: PositiveFloat


class LectureDay(BaseModel):
    """
    defines the day, time range, and location of a lecture day for a course

    Attributes:
        - day (str): the day of the week (e.g. Monday, Tuesday, Wednesday)
        - time (TimeRange): the time range for the lecture day (e.g. 02:00:00 - 10:00:00, 13:00:00 - 15:00:00)
        - location (str): the location of the lecture day (e.g. Room 101, Room 102)
    """

    day: str
    time: TimeRange
    location: str


class Topic(BaseModel):
    """
    defines the title of a topic for a week

    Attributes:
        - title (str): the title of the topic (e.g. Introduction to Computing, Data Structures and Algorithms)
    """

    title: str


class Chapter(BaseModel):
    """
    defines the title of a chapter for a week

    Attributes:
        - chapter (str): the title of the chapter (e.g. Chapter 1, CH 2)
    """

    chapter: str


class Assessment(BaseModel):
    """
    defines the name, type, due date, and weight of an assessment for a week

    Attributes:
        - name (str): the name of the assessment (e.g. Quiz 1, Lab 1)
        - type (str): the type of the assessment (e.g. quiz, lab, midsem)
        - due_date (Optional[date]): the due date of the assessment (e.g. 2024-02-01, 2024-02-15)
        - weight (Optional[float]): the weight of the assessment (e.g. 15, 20)
    """

    name: str
    type: str
    due_date: Optional[date]
    weight: Optional[PositiveFloat]


class Week(BaseModel):
    """
    defines the week number, start date, end date, type, topics, reading, and assessments for a course

    Attributes:
        - week_number (PositiveInt): the week number of the course (e.g. 1, 2, 3)
        - start_date (Optional[date]): the start date of the week (e.g. 2024-02-01, 2024-02-15)
        - end_date (Optional[date]): the end date of the week (e.g. 2024-02-01, 2024-02-15)
        - type (str): the type of the week (e.g. revision, midsem, lecture)
        - topics (List[Topic]): the topics for the week (e.g. [Topic, Topic, ...])
        - reading (List[Chapter]): the reading for the week (e.g. [Chapter, Chapter, ...])
        - assessments (Optional[List[Assessment]]): the assessments for the week (e.g. [Assessment, Assessment, ...])
    """

    week_number: PositiveInt
    start_date: Optional[date]
    end_date: Optional[date]
    type: str
    topics: List[Topic]
    reading: List[Chapter]
    assessments: Optional[List[Assessment]]

class Course(BaseModel):
    """
    defines details of a course

    Attributes:
        - code (str): the code of the course (e.g. CS111, CS222)
        - name (str): the name of the course (e.g. Introduction to Computing, Data Structures and Algorithms)
        - description (str): the description of the course (e.g. This course introduces students to the basics of computing)
        - semester (Semester): the semester of the course (e.g. Semester)
        - instructors (Instructor): the instructor of the course (e.g. [Instructor, Instructor, ...])
        - faculty_interns (Instructor): the faculty intern of the course (e.g. [Instructor, Instructor, ...])
        - textbooks (List[Textbook]): the textbooks for the course (e.g. [Textbook, Textbook, ...])
        - evaluation_criteria (List[EvaluationCriteria]): the evaluation criteria for the course (e.g. [EvaluationCriteria, EvaluationCriteria, ...])
        - lecture_days (List[LectureDay]): the lecture days for the course (e.g. [LectureDay, LectureDay, ...])
        - weekly_schedule (List[Week]): the weekly schedule for the course (e.g. [Week, Week, ...])
    """

    code: str
    name: str
    description: str
    semester: Semester
    instructors: List[Instructor]
    faculty_interns: List[Instructor]
    textbooks: List[Textbook]
    evaluation_criteria: List[EvaluationCriteria]
    lecture_days: List[LectureDay]
    weekly_schedule: List[Week]