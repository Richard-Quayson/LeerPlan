from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from django.core.files.uploadedfile import InMemoryUploadedFile
from rest_framework.request import Request
import json

from .models import (
    Semester, Instructor, InstructorType, Course, CourseInstructor, CourseInstructorOfficeHour, Day,
    CourseEvaluationCriteria, CourseLectureDay, CourseTextbook, TextbookType, CourseWeeklySchedule,
    CourseWeeklyAssessment, CourseWeeklyReading, CourseWeeklyTopic, UserCourse,
)
from .serializers import (
    SemesterSerializer, InstructorSerializer, CourseSerializer, CourseInstructorSerializer,
    CourseInstructorOfficeHourSerializer, CourseEvaluationCriteriaSerializer, CourseLectureDaySerializer,
    CourseTextbookSerializer, CourseWeeklyScheduleSerializer, CourseWeeklyAssessmentSerializer,
    CourseWeeklyReadingSerializer, CourseWeeklyTopicSerializer, UserCourseSerializer,
)
from .helper import LECTURER, FACULTY_INTERN
from Account.models import University
from Account.permissions import IsAccessTokenBlacklisted


class CreateCourseView(APIView):
    permission_classes = [IsAuthenticated, IsAccessTokenBlacklisted]

    def post(self, request):
        # course files
        course_files = request.FILES.getlist('course_files')

        # create course for every course file
        for course_file in course_files:

            # read course data
            course_data = CreateCourseView.read_course_json(course_file)

            # populate course data
            response = CreateCourseView.populate_course_data(course_data)

            # return response if error
            if isinstance(response, Response):
                return response
        
        return Response(status=status.HTTP_201_CREATED)


    @staticmethod
    def read_course_json(course_file: InMemoryUploadedFile) -> dict:
        """read course json file and return course data"""

        # open course file
        with course_file.open('r') as file:
            # read course data
            course_data = file.read()
            course_file.close()
            course_data = json.loads(course_data)

        return course_data

    @staticmethod
    def populate_course_data(course_data: dict, request: Request):
        """populate course data across all course models"""

        # create semester
        semester = CreateCourseView.create_semester(course_data['semester'])
        if isinstance(semester, Response):
            return semester
        
        # create course
        course = CreateCourseView.create_course(
            name=course_data['name'],
            code=course_data['code'],
            description=course_data['description'] if 'description' in course_data else None,
            university=request.data['university'],
            semester=semester
        )
        if isinstance(course, Response):
            return course
        
        # create instructors
        instructors = CreateCourseView.create_instructors(course_data['instructors'], course)
        if isinstance(instructors, Response):
            return instructors


    @staticmethod
    def create_semester(semester_data: dict) -> Semester:
        """create semester if it does not exist"""

        try:
            semester = Semester.objects.get(name=semester_data['name'], year=semester_data['year'])
        except Semester.DoesNotExist:
            semester_serializer = SemesterSerializer(data={
                'name': semester_data['name'],
                'year': semester_data['year'],
            })
            if semester_serializer.is_valid():
                semester = semester_serializer.save()
            else:
                return Response(semester_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
        return semester


    @staticmethod
    def create_course(code: str, name: str, description: str, university: int, semester: Semester) -> Course:
        """create course if it does not exist"""

        try:
            course = Course.objects.get(code=code, name=name, university=university, semester=semester)
        except Course.DoesNotExist:
            course_serializer = CourseSerializer(data={
                'code': code,
                'name': name,
                'description': description,
                'university': university,
                'semester': semester
            })
            if course_serializer.is_valid():
                course = course_serializer.save()
            else:
                return Response(course_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        return course
    

    @staticmethod
    def create_instructors(instructors_data: list, course: Course) -> list:
        """create instructors if they do not exist"""

        instructors = list()
        for instructor_data in instructors_data:
            try:
                instructor = Instructor.objects.get(email=instructor_data['email'])
            except Instructor.DoesNotExist:
                instructor = CreateCourseView.create_instructor(instructor_data, LECTURER, course)
                if isinstance(instructor, Response):
                    return instructor
            
            instructors.append(instructor)
        
        return instructors
    

    @staticmethod
    def create_instructor(instructor_data: dict, type: str, course: Course) -> Instructor:
        """create instructor and associated office hours"""

        instructor_serializer = InstructorSerializer(data={
            'name': instructor_data['name'],
            'email': instructor_data['email'],
            'type': type,
            'phone': instructor_data['phone'] if 'phone' in instructor_data else None,
        })
        if instructor_serializer.is_valid():
            instructor = instructor_serializer.save()
        else:
            return Response(instructor_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        # create course instructor
        course_instructor = CreateCourseView.create_course_instructor(course, instructor)
        if isinstance(course_instructor, Response):
            return course_instructor
        
        # create office hours
        office_hours = CreateCourseView.create_office_hours(instructor_data['office_hours'], course_instructor)
        if isinstance(office_hours, Response):
            return office_hours
        
        return instructor

    
    @staticmethod
    def create_course_instructor(course: Course, instructor: Instructor) -> CourseInstructor:
        """create course instructor"""

        try:
            course_instructor = CourseInstructor.objects.get(course=course, instructor=instructor)
        except CourseInstructor.DoesNotExist:
            course_instructor_serializer = CourseInstructorSerializer(data={
                'course': course.id,
                'instructor': instructor.id,
            })
            if course_instructor_serializer.is_valid():
                course_instructor = course_instructor_serializer.save()
            else:
                return Response(course_instructor_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        return course_instructor


    @staticmethod
    def create_office_hours(office_hours_data: list, course_instructor: CourseInstructor) -> list:
        """create office hours for an instructor"""

        course_instructor_office_hours = list()
        for office_hour_data in office_hours_data:
            try:
                office_hour = CourseInstructorOfficeHour.objects.get(
                    course_instructor=course_instructor,
                    day=office_hour_data['day'],
                    start_time=office_hour_data['time']['start_time'],
                    end_time=office_hour_data['time']['end_time']
                )
            except CourseInstructorOfficeHour.DoesNotExist:
                office_hour_serializer = CourseInstructorOfficeHourSerializer(data={
                    'course_instructor': course_instructor.id,
                    'day': office_hour_data['day'],
                    'start_time': office_hour_data['time']['start_time'],
                    'end_time': office_hour_data['time']['end_time'],
                })
                if office_hour_serializer.is_valid():
                    office_hour = office_hour_serializer.save()
                else:
                    return Response(office_hour_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
            course_instructor_office_hours.append(office_hour)

        return course_instructor_office_hours