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
            result = CreateCourseView.populate_course_data(course_data)
            if isinstance(result, Response):
                return result
        
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