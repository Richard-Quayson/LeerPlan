from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from django.core.files.uploadedfile import InMemoryUploadedFile
from rest_framework.request import Request
from io import BytesIO
import json

from .models import (
    Semester, Instructor, Course, CourseInstructor, CourseInstructorOfficeHour,
    CourseEvaluationCriteria, CourseLectureDay, CourseTextbook, CourseWeeklySchedule,
    CourseWeeklyAssessment, CourseWeeklyReading, CourseWeeklyTopic, CourseFile, UserCourse,
)
from .serializers import (
    SemesterSerializer, InstructorSerializer, CourseSerializer, CourseInstructorSerializer,
    CourseInstructorOfficeHourSerializer, CourseEvaluationCriteriaSerializer, CourseLectureDaySerializer,
    CourseTextbookSerializer, CourseWeeklyScheduleSerializer, CourseWeeklyAssessmentSerializer,
    CourseWeeklyReadingSerializer, CourseWeeklyTopicSerializer, CourseFileSerializer, UserCourseSerializer,
)
from .helper import LECTURER, FACULTY_INTERN
from Account.models import UserAccount
from Account.permissions import IsAccessTokenBlacklisted


class CreateCourseView(APIView):
    permission_classes = [IsAuthenticated, IsAccessTokenBlacklisted]

    def post(self, request):
        # course files
        course_files = request.FILES.getlist('course_files')

        # create course for every course file
        user_courses = list()
        for course_file in course_files:
            course_file_name = course_file.name
            course_file_content_type = course_file.content_type
            course_file_size = course_file.size

            # read course data
            course_data = CreateCourseView.read_course_json(course_file)

            # populate course data
            response = CreateCourseView.populate_course_data(course_data, request)
            # return response if error
            if isinstance(response, Response):
                return response
            
            # create course file object
            in_memory_file = InMemoryUploadedFile(
                file=BytesIO(course_data),
                field_name='file',
                name=course_file_name,
                content_type=course_file_content_type,
                size=course_file_size,
                charset=None
            )
            course_file = CreateCourseView.create_course_file(in_memory_file, response['semester'], response['course'])
            if isinstance(course_file, Response):
                return course_file
            
            # create user course object
            user_course = CreateCourseView.create_user_course(request.user, response['course'])
            if isinstance(user_course, Response):
                return user_course
            
            user_courses.append(user_course)
        
        return Response(UserCourseSerializer(user_courses, many=True, context={'request': request}).data, status=status.HTTP_201_CREATED)


    @staticmethod
    def read_course_json(course_file: InMemoryUploadedFile) -> dict:
        """read course json file and return course data"""

        # open course file
        with course_file.open('r') as file:
            # read course data
            course_data = file.read()

        return course_data


    @staticmethod
    def populate_course_data(course_data: dict, request: Request):
        """populate course data across all course models"""

        course_data = json.loads(course_data)

        # create semester
        semester = CreateCourseView.create_semester(course_data['semester'], request)
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
        
        # create instructors (lecturers)
        instructors = CreateCourseView.create_instructors(course_data['instructors'], course, LECTURER)
        if isinstance(instructors, Response):
            return instructors
        
        # create instructors (faculty interns)
        faculty_interns = CreateCourseView.create_instructors(course_data['faculty_interns'], course, FACULTY_INTERN)
        if isinstance(faculty_interns, Response):
            return faculty_interns
        
        # create course evaluation criteria
        evaluation_criteria = CreateCourseView.create_course_evaluation_criteria(course_data['evaluation_criteria'], course)
        if isinstance(evaluation_criteria, Response):
            return evaluation_criteria
        
        # create course lecture days
        lecture_days = CreateCourseView.create_lecture_days(course_data['lecture_days'], course)
        if isinstance(lecture_days, Response):
            return lecture_days
        
        # create course textbooks
        textbooks = CreateCourseView.create_course_textbooks(course_data['textbooks'], course)
        if isinstance(textbooks, Response):
            return textbooks
        
        # create course weekly schedule
        weekly_schedule = CreateCourseView.create_course_weekly_schedule(course_data['weekly_schedule'], course)
        if isinstance(weekly_schedule, Response):
            return weekly_schedule
        
        # prepare dictionary for course file object
        response = {
            'semester': semester,
            'course': course
        }

        return response


    @staticmethod
    def create_semester(semester_data: dict, request: Request) -> Semester:
        """create semester if it does not exist"""

        try:
            semester = Semester.objects.get(name=semester_data['name'], year=semester_data['year'])
        except Semester.DoesNotExist:
            semester_serializer = SemesterSerializer(data={
                'name': semester_data['name'],
                'year': semester_data['year'],
                'university': request.data['university']
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
                'university': university.id,
                'semester': semester.id
            })
            if course_serializer.is_valid():
                course = course_serializer.save()
            else:
                return Response(course_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        return course
    

    @staticmethod
    def create_instructors(instructors_data: list, course: Course, instructor_type: str) -> list:
        """create instructors if they do not exist"""

        instructors = list()
        for instructor_data in instructors_data:
            try:
                instructor = Instructor.objects.get(email=instructor_data['email'])
            except Instructor.DoesNotExist:
                instructor = CreateCourseView.create_instructor(instructor_data, instructor_type, course)
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
                    day=office_hour_data['day'].lower(),
                    start_time=office_hour_data['time']['start_time'],
                    end_time=office_hour_data['time']['end_time']
                )
            except CourseInstructorOfficeHour.DoesNotExist:
                office_hour_serializer = CourseInstructorOfficeHourSerializer(data={
                    'course_instructor': course_instructor.id,
                    'day': office_hour_data['day'].lower(),
                    'start_time': office_hour_data['time']['start_time'],
                    'end_time': office_hour_data['time']['end_time'],
                })
                if office_hour_serializer.is_valid():
                    office_hour = office_hour_serializer.save()
                else:
                    return Response(office_hour_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
            course_instructor_office_hours.append(office_hour)

        return course_instructor_office_hours
    

    @staticmethod
    def create_course_evaluation_criteria(evaluation_criteria_data: list, course: Course) -> list:
        """create course evaluation criteria"""

        course_evaluation_criteria = list()
        for criteria_data in evaluation_criteria_data:
            try:
                criteria = CourseEvaluationCriteria.objects.get(
                    course=course,
                    type=criteria_data['type']
                )
            except CourseEvaluationCriteria.DoesNotExist:
                criteria_serializer = CourseEvaluationCriteriaSerializer(data={
                    'course': course.id,
                    'type': criteria_data['type'],
                    'weight': criteria_data['weight']
                })
                if criteria_serializer.is_valid():
                    criteria = criteria_serializer.save()
                else:
                    return Response(criteria_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
            course_evaluation_criteria.append(criteria)
        
        return course_evaluation_criteria
    

    @staticmethod
    def create_lecture_days(lecture_days_data: list, course: Course) -> list:
        """create lecture days"""

        lecture_days = list()
        for lecture_day_data in lecture_days_data:
            try:
                lecture_day = CourseLectureDay.objects.get(
                    course=course,
                    day=lecture_day_data['day'].lower(),
                    start_time=lecture_day_data['time']['start_time'],
                    end_time=lecture_day_data['time']['end_time']
                )
            except CourseLectureDay.DoesNotExist:
                lecture_day_serializer = CourseLectureDaySerializer(data={
                    'course': course.id,
                    'day': lecture_day_data['day'].lower(),
                    'location': lecture_day_data['location'],
                    'start_time': lecture_day_data['time']['start_time'],
                    'end_time': lecture_day_data['time']['end_time'],
                })
                if lecture_day_serializer.is_valid():
                    lecture_day = lecture_day_serializer.save()
                else:
                    return Response(lecture_day_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
            lecture_days.append(lecture_day)
        
        return lecture_days
    

    @staticmethod
    def create_course_textbooks(textbooks_data: list, course: Course) -> list:
        """create course textbooks"""

        textbooks = list()
        for textbook_data in textbooks_data:
            try:
                textbook = CourseTextbook.objects.get(
                    course=course,
                    title=textbook_data['title']
                )
            except CourseTextbook.DoesNotExist:
                textbook_serializer = CourseTextbookSerializer(data={
                    'course': course.id,
                    'title': textbook_data['title'],
                    'type': textbook_data['type'].lower() if 'type' in textbook_data else None
                })
                if textbook_serializer.is_valid():
                    textbook = textbook_serializer.save()
                else:
                    return Response(textbook_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
            textbooks.append(textbook)
        
        return textbooks
    

    @staticmethod
    def create_course_weekly_schedule(weekly_schedule_data: list, course: Course) -> list:
        """create course weekly schedule"""

        weekly_schedule = list()
        for week_data in weekly_schedule_data:
            # create weekly schedule
            week = CreateCourseView.create_week(week_data, course)
            if isinstance(week, Response):
                return week
            
            weekly_schedule.append(week)
        
        return weekly_schedule
    

    @staticmethod
    def create_week(week_data: dict, course: Course) -> CourseWeeklySchedule:
        """create week for a course"""

        try:
            week = CourseWeeklySchedule.objects.get(
                course=course,
                week_number=week_data['week_number']
            )
        except CourseWeeklySchedule.DoesNotExist:
            week_serializer = CourseWeeklyScheduleSerializer(data={
                'course': course.id,
                'week_number': week_data['week_number'],
                'type': week_data['type'].capitalize(),
                'start_date': week_data['start_date'] if 'start_date' in week_data else "",
                'end_date': week_data['end_date'] if 'end_date' in week_data else ""
            })
            if week_serializer.is_valid():
                week = week_serializer.save()
            else:
                return Response(week_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
        # create weekly assessments
        assessments = CreateCourseView.create_assessments(week_data['assessments'], week)
        if isinstance(assessments, Response):
            return assessments
        
        # create weekly topics
        topics = CreateCourseView.create_topics(week_data['topics'], week)
        if isinstance(topics, Response):
            return topics
        
        # create weekly readings
        readings = CreateCourseView.create_readings(week_data['readings'], week)
        if isinstance(readings, Response):
            return readings
        
        return week
    

    @staticmethod
    def create_assessments(assessments_data: list, week: CourseWeeklySchedule) -> list:
        """create weekly assessments"""

        assessments = list()
        for assessment_data in assessments_data:
            try:
                assessment = CourseWeeklyAssessment.objects.get(
                    course_weekly_schedule=week,
                    name=assessment_data['name']
                )
            except CourseWeeklyAssessment.DoesNotExist:
                assessment_serializer = CourseWeeklyAssessmentSerializer(data={
                    'course_weekly_schedule': week.id,
                    'name': assessment_data['name'],
                    'type': assessment_data['type'],
                    'weight': assessment_data['weight'] if 'weight' in assessment_data else 0.0,
                    'due_date': assessment_data['due_date'] if 'due_date' in assessment_data else ""
                })
                if assessment_serializer.is_valid():
                    assessment = assessment_serializer.save()
                else:
                    return Response(assessment_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
            assessments.append(assessment)
        
        return assessments
    

    @staticmethod
    def create_topics(topics_data: list, week: CourseWeeklySchedule) -> list:
        """create weekly topics"""

        topics = list()
        for topic_data in topics_data:
            try:
                topic = CourseWeeklyTopic.objects.get(
                    course_weekly_schedule=week,
                    topic=topic_data['title']
                )
            except CourseWeeklyTopic.DoesNotExist:
                topic_serializer = CourseWeeklyTopicSerializer(data={
                    'course_weekly_schedule': week.id,
                    'topic': topic_data['title']
                })
                if topic_serializer.is_valid():
                    topic = topic_serializer.save()
                else:
                    return Response(topic_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
            topics.append(topic)
        
        return topics
    

    @staticmethod
    def create_readings(readings_data: list, week: CourseWeeklySchedule) -> list:
        """create weekly readings"""

        readings = list()
        for reading_data in readings_data:
            try:
                reading = CourseWeeklyReading.objects.get(
                    course_weekly_schedule=week,
                    chapter=reading_data['chapter']
                )
            except CourseWeeklyReading.DoesNotExist:
                reading_serializer = CourseWeeklyReadingSerializer(data={
                    'course_weekly_schedule': week.id,
                    'chapter': reading_data['chapter']
                })
                if reading_serializer.is_valid():
                    reading = reading_serializer.save()
                else:
                    return Response(reading_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
            readings.append(reading)
        
        return readings
    

    @staticmethod
    def create_course_file(course_file: InMemoryUploadedFile, semester: Semester, course: Course):
        """create course file object"""

        try:
            course_file = CourseFile.objects.get(
                semester=semester,
                course=course
            )
        except CourseFile.DoesNotExist:
            course_file_serializer = CourseFileSerializer(data={
                'semester': semester.id,
                'course': course.id,
                'file': course_file
            })
            if course_file_serializer.is_valid():
                course_file = course_file_serializer.save()
            else:
                return Response(course_file_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
        return course_file
    

    @staticmethod
    def create_user_course(user:UserAccount, course: Course):
        """create user course object"""

        try:
            user_course = UserCourse.objects.get(user=user, course=course)
        except UserCourse.DoesNotExist:
            user_course_serializer = UserCourseSerializer(data={
                'user': user.id,
                'course': course.id
            })
            if user_course_serializer.is_valid():
                user_course = user_course_serializer.save()
            else:
                return Response(user_course_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        return user_course