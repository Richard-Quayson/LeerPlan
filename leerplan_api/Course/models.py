from django.db import models
from Account.models import University


class Semester(models.Model):
    """
    defines a semester model

    Attributes:
        - name: the name of the semester
        - year: the year of the semester
        - university: the university for the semester
    """

    name = models.CharField(max_length=100)
    year = models.IntegerField()
    university = models.ForeignKey(University, on_delete=models.CASCADE)

    def __str__(self):
        return f"{self.university.name} : {self.name} {self.year}"
    

class Instructor(models.Model):
    """
    defines an instructor model

    Attributes:
        - firstname: the first name of the instructor
        - lastname: the last name of the instructor
        - email: the email of the instructor
        - phone: the phone number of the instructor
        - type: the type of the instructor (e.g. lecturer, assistant)
    """

    firstname = models.CharField(max_length=100)
    lastname = models.CharField(max_length=100)
    email = models.EmailField()
    phone = models.CharField(max_length=15)
    type = models.CharField(max_length=100)

    def __str__(self):
        return f"{self.firstname} {self.lastname} ({self.type.capitalize()}) : {self.email} ({self.phone})" 
    

class Course(models.Model):
    """
    defines a course model

    Attributes:
        - name: the name of the course
        - code: the code of the course
        - description: the description of the course
        - university: the university offering the course
        - semester: the semester the course is offered in
        - date_created: the date the course was created
        - date_updated: the date the course was last updated
    """

    name = models.CharField(max_length=255)
    code = models.CharField(max_length=10)
    description = models.TextField()
    university = models.ForeignKey(University, on_delete=models.CASCADE)
    semester = models.ForeignKey(Semester, on_delete=models.CASCADE)
    date_created = models.DateTimeField(auto_now_add=True)
    date_updated = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.university.name} : {self.name} ({self.code})"
    

class CourseInstructor(models.Model):
    """
    defines a course instructor model

    Attributes:
        - course: the course the instructor is assigned to
        - instructor: the instructor assigned to the course
    """

    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    instructor = models.ForeignKey(Instructor, on_delete=models.CASCADE)

    def __str__(self):
        return f"{self.course.name} ({self.course.code}) : {self.instructor.firstname} {self.instructor.lastname} ({self.instructor.type.capitalize()})"
    

class CourseInstructorOfficeHours(models.Model):
    """
    defines a course instructor office hours model

    Attributes:
        - course_instructor: the course instructor the office hours are held for
        - day: the day of the week the office hours are held
        - start_time: the start time of the office hours
        - end_time: the end time of the office hours
    """

    course_instructor = models.ForeignKey(CourseInstructor, on_delete=models.CASCADE)
    day = models.CharField(max_length=10)
    start_time = models.TimeField()
    end_time = models.TimeField()

    def __str__(self):
        return f"{self.course_instructor.course.name} : {self.course_instructor.instructor.firstname} {self.course_instructor.instructor.lastname} ({self.day} {self.start_time} - {self.end_time})"
    

class CourseEvaluationCriteria(models.Model):
    """
    defines a course evaluation criteria model

    Attributes:
        - course: the course the evaluation criteria is for
        - type: the type of evaluation criteria (e.g. exam, assignment)
        - weight: the weight of the evaluation criteria
    """

    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    type = models.CharField(max_length=100)
    weight = models.FloatField()

    def __str__(self):
        return f"{self.course.name} ({self.course.code}) : {self.type.capitalize()} ({self.weight})"
    

class CourseLectureDay(models.Model):
    """
    defines a course lecture day model

    Attributes:
        - course: the course the lecture day is for
        - day: the day of the week the lecture is held
        - location: the location of the lecture for that day
        - start_time: the start time of the lecture
        - end_time: the end time of the lecture
    """

    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    day = models.CharField(max_length=10)
    location = models.CharField(max_length=255)
    start_time = models.TimeField()
    end_time = models.TimeField()

    def __str__(self):
        return f"{self.course.name} : {self.day} ({self.start_time} - {self.end_time}) @ {self.location}"
    

class CourseTextbook(models.Model):
    """
    defines a course textbook model

    Attributes:
        - course: the course the textbook is for
        - title: the title of the textbook
        - type: the type of the textbook (e.g. primary, secondary)
    """

    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    title = models.CharField(max_length=255)
    type = models.CharField(max_length=100)

    def __str__(self):
        return f"{self.course.name} ({self.course.code}) : {self.title} ({self.type.capitalize()})"


class CourseWeeklySchedule(models.Model):
    """
    defines a course weekly schedule model

    Attributes:
        - course: the course the weekly schedule is for
        - week_number: the week number of the schedule
        - type: the type of the schedule (e.g. regular, midsem_break, midsem_exam, revision, etc.)
        - start_date: the start date of the weekly schedule
        - end_date: the end date of the weekly schedule
    """

    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    week_number = models.IntegerField()
    type = models.CharField(max_length=100)
    start_date = models.DateField()
    end_date = models.DateField()

    def __str__(self):
        return f"{self.course.name} ({self.course.code}) : Week {self.week_number} ({self.type.capitalize()}) ({self.start_date} - {self.end_date})"


class CourseWeeklyAssessment(models.Model):
    """
    defines a course weekly assessment model

    Attributes:
        - course_weekly_schedule: the course weekly schedule the assessment is for
        - name: the name of the assessment
        - type: the type of the assessment (e.g. quiz, assignment, etc.)
        - weight: the weight of the assessment
        - due_date: the due date of the assessment
    """

    course_weekly_schedule = models.ForeignKey(CourseWeeklySchedule, on_delete=models.CASCADE)
    name = models.CharField(max_length=100)
    type = models.CharField(max_length=50)
    weight = models.FloatField()
    due_date = models.DateField()

    def __str__(self):
        return f"{self.course_weekly_schedule.course.name} : {self.name} ({self.type.capitalize()}) ({self.weight}) ({self.due_date})"