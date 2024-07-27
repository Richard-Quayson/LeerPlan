from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.request import Request
from django.core.files.uploadedfile import InMemoryUploadedFile
from django.db import transaction
from datetime import datetime, timedelta
from django.utils.dateparse import parse_time
from io import BytesIO
import json
import os

from .models import (
    Semester, Instructor, Course, CourseInstructor, CourseInstructorOfficeHour,
    CourseEvaluationCriteria, CourseCohort, CourseLectureDay, CourseTextbook, CourseWeeklySchedule,
    CourseWeeklyAssessment, CourseWeeklyReading, CourseWeeklyTopic, CourseFile, UserCourse,
)
from .serializers import (
    SemesterSerializer, InstructorSerializer, CourseSerializer, CourseInstructorSerializer,
    CourseInstructorOfficeHourSerializer, CourseEvaluationCriteriaSerializer, CourseCohortSerializer,
    CourseLectureDaySerializer, CourseTextbookSerializer, CourseWeeklyScheduleSerializer,
    CourseWeeklyAssessmentSerializer, CourseWeeklyReadingSerializer, CourseWeeklyTopicSerializer,
    CourseFileSerializer, UserCourseSerializer,
)
from .helper import LECTURER, FACULTY_INTERN
from Account.models import UserAccount, UserMetaData, UserRoutine
from Account.serializers import UserMetaDataSerializer, UserRoutineSerializer
from Account.permissions import IsAccessTokenBlacklisted
from Account.helper import get_extended_routine_data
from DataSynthesis.extract import extract_text_from_pdf
from DataSynthesis.synthesise import gemini_synthesise


class CreateCourseView(APIView):
    permission_classes = [IsAuthenticated, IsAccessTokenBlacklisted]

    def post(self, request):
        # create course for every course file
        user_courses = list()

        for _, course_file in request.FILES.items():
            course_file_name = course_file.name
            course_file_content_type = course_file.content_type
            course_file_size = course_file.size

            # extract text from course file
            extracted_course_data = extract_text_from_pdf(course_file)

            # synthesise course data
            synthesised_course_file = gemini_synthesise(
                course_file_name, extracted_course_data)

            # read course data
            course_data = CreateCourseView.read_course_json(
                synthesised_course_file)

            # populate course data
            response = CreateCourseView.populate_course_data(
                course_data, request)
            # return response if error
            if isinstance(response, Response):
                return response

            # convert course_data back to JSON string and then to bytes
            course_data_json = json.dumps(course_data)
            course_data_bytes = course_data_json.encode('utf-8')

            # create course file object
            in_memory_file = InMemoryUploadedFile(
                file=BytesIO(course_data_bytes),
                field_name='file',
                name=course_file_name,
                content_type=course_file_content_type,
                size=course_file_size,
                charset=None
            )
            course_file = CreateCourseView.create_course_file(
                in_memory_file, response['semester'], response['course'])
            if isinstance(course_file, Response):
                return course_file

            # create user course object
            user_course = CreateCourseView.create_user_course(
                request.user, response['course'])
            if isinstance(user_course, Response):
                return user_course

            user_courses.append(user_course)

        return Response(UserCourseSerializer(user_courses, many=True, context={'request': request}).data, status=status.HTTP_201_CREATED)

    @staticmethod
    def read_course_json(course_file_path: str) -> dict:
        """Read course JSON file and return course data"""

        # open and read the course file
        try:
            with open(course_file_path, 'r', encoding='utf-8') as file:
                # read and parse the JSON data
                course_data = json.load(file)
        except json.JSONDecodeError:
            raise ValueError(
                f"The file {course_file_path} is not a valid JSON file.")
        except Exception as e:
            raise IOError(
                f"An error occurred while reading the file: {str(e)}")

        return course_data

    @staticmethod
    def populate_course_data(course_data: dict, request: Request):
        """populate course data across all course models"""

        if isinstance(course_data, str):
            try:
                course_data = json.loads(course_data)
            except json.JSONDecodeError as e:
                raise ValueError("Invalid JSON data provided") from e

        # create semester
        semester = CreateCourseView.create_semester(
            course_data['semester'], request)
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
        instructors = CreateCourseView.create_instructors(
            course_data['instructors'], course, LECTURER)
        if isinstance(instructors, Response):
            # not critical, continue with other data
            pass
            # return instructors

        # create instructors (faculty interns)
        faculty_interns = CreateCourseView.create_instructors(
            course_data['faculty_interns'], course, FACULTY_INTERN)
        if isinstance(faculty_interns, Response):
            # not critical, continue with other data
            pass
            # return faculty_interns

        # create course evaluation criteria
        evaluation_criteria = CreateCourseView.create_course_evaluation_criteria(
            course_data['evaluation_criteria'], course)
        if isinstance(evaluation_criteria, Response):
            # not critical, continue with other data
            pass
            # return evaluation_criteria

        # create course cohorts and cohort lecture days
        lecture_days = CreateCourseView.create_course_cohorts(
            course_data['cohorts'], course)
        if isinstance(lecture_days, Response):
            return lecture_days

        # create course textbooks
        textbooks = CreateCourseView.create_course_textbooks(
            course_data['textbooks'], course)
        if isinstance(textbooks, Response):
            # not critical, continue with other data
            pass
            # return textbooks

        # create course weekly schedule
        weekly_schedule = CreateCourseView.create_course_weekly_schedule(
            course_data['weekly_schedule'], course)
        if isinstance(weekly_schedule, Response):
            # not critical, continue with other data
            pass
            # return weekly_schedule

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
            semester = Semester.objects.get(
                name=semester_data['name'], year=semester_data['year'])
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
            course = Course.objects.get(
                code=code, name=name, university=university, semester=semester)
        except Course.DoesNotExist:
            course_serializer = CourseSerializer(data={
                'code': code,
                'name': name,
                'description': description,
                'university': university,
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
                instructor = Instructor.objects.get(
                    email=instructor_data['email'])
                instructor = CourseInstructor.objects.create(
                    course=course, instructor=instructor)

                # create office hours
                office_hours = CreateCourseView.create_office_hours(
                    instructor_data['office_hours'], instructor)
                if isinstance(office_hours, Response):
                    return office_hours
            except Instructor.DoesNotExist:
                instructor = CreateCourseView.create_instructor(
                    instructor_data, instructor_type, course)
                if isinstance(instructor, Response):
                    return instructor

            instructors.append(instructor)

        return instructors

    @staticmethod
    def create_instructor(instructor_data: dict, type: str, course: Course) -> Instructor:
        """create instructor and associated office hours"""

        try:
            instructor = Instructor.objects.get(email=instructor_data['email'])
        except Instructor.DoesNotExist:
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
        course_instructor = CreateCourseView.create_course_instructor(
            course, instructor)
        if isinstance(course_instructor, Response):
            return course_instructor

        # create office hours
        office_hours = CreateCourseView.create_office_hours(
            instructor_data['office_hours'], course_instructor)
        if isinstance(office_hours, Response):
            return office_hours

        return instructor

    @staticmethod
    def create_course_instructor(course: Course, instructor: Instructor) -> CourseInstructor:
        """create course instructor"""

        try:
            course_instructor = CourseInstructor.objects.get(
                course=course, instructor=instructor)
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
            day = office_hour_data.get('day', '').lower()
            time_data = office_hour_data.get('time', None)
            start_time = time_data.get(
                'start_time', None) if time_data else None
            end_time = time_data.get('end_time', None) if time_data else None

            try:
                office_hour = CourseInstructorOfficeHour.objects.get(
                    course_instructor=course_instructor,
                    day=day,
                    start_time=start_time,
                    end_time=end_time
                )
            except CourseInstructorOfficeHour.DoesNotExist:
                office_hour_serializer = CourseInstructorOfficeHourSerializer(data={
                    'course_instructor': course_instructor.id,
                    'day': day,
                    'start_time': start_time,
                    'end_time': end_time,
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
    def create_course_cohorts(cohorts_data: list, course: Course) -> list:
        """create course cohorts"""

        cohorts = list()
        for cohort in cohorts_data:
            try:
                course_cohort = CourseCohort.objects.get(
                    course=course,
                    name=cohort['cohort_name']
                )
            except CourseCohort.DoesNotExist:
                cohort_serializer = CourseCohortSerializer(data={
                    'course': course.id,
                    'name': cohort['cohort_name']
                })
                if cohort_serializer.is_valid():
                    course_cohort = cohort_serializer.save()
                else:
                    return Response(cohort_serializer.errors, status=status.HTTP_400_BAD_REQUEST)

            cohorts.append(course_cohort)

            # create course cohort lecture days
            lecture_days = CreateCourseView.create_lecture_days(
                cohort['lecture_days'], course_cohort)
            if isinstance(lecture_days, Response):
                return lecture_days

        return cohorts

    @staticmethod
    def create_lecture_days(lecture_days_data: list, cohort: CourseCohort) -> list:
        """create lecture days"""

        lecture_days = list()
        for lecture_day_data in lecture_days_data:
            try:
                lecture_day = CourseLectureDay.objects.get(
                    course_cohort=cohort,
                    day=lecture_day_data['day'].lower(),
                    start_time=lecture_day_data['time']['start_time'],
                    end_time=lecture_day_data['time']['end_time']
                )
            except CourseLectureDay.DoesNotExist:
                lecture_day_serializer = CourseLectureDaySerializer(data={
                    'course_cohort': cohort.id,
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
                textbook_type = textbook_data.get('type')

                if textbook_type is not None:
                    textbook_type = textbook_type.lower()
                else:
                    textbook_type = 'secondary'

                textbook_serializer = CourseTextbookSerializer(data={
                    'course': course.id,
                    'title': textbook_data['title'],
                    'type': textbook_type
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
        assessments = CreateCourseView.create_assessments(
            week_data['assessments'], week)
        if isinstance(assessments, Response):
            return assessments

        # create weekly topics
        topics = CreateCourseView.create_topics(week_data['topics'], week)
        if isinstance(topics, Response):
            return topics

        # create weekly readings
        readings = CreateCourseView.create_readings(
            week_data['readings'], week)
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
                weight = assessment_data['weight']
                if weight is not None:
                    weight = float(weight)
                else:
                    weight = 0.0

                assessment_serializer = CourseWeeklyAssessmentSerializer(data={
                    'course_weekly_schedule': week.id,
                    'name': assessment_data['name'],
                    'type': assessment_data['type'],
                    'weight': weight,
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
    def create_user_course(user: UserAccount, course: Course):
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


class RetrieveUserCoursesView(APIView):
    permission_classes = [IsAuthenticated, IsAccessTokenBlacklisted]

    def get(self, request):
        user_courses = UserCourse.objects.filter(user=request.user)
        return Response(UserCourseSerializer(user_courses, many=True, context={'request': request}).data, status=status.HTTP_200_OK)


class SpecifyCourseCohortView(APIView):
    permission_classes = [IsAuthenticated, IsAccessTokenBlacklisted]

    def patch(self, request):
        try:
            user_course = UserCourse.objects.get(
                id=request.data['user_course'])
        except UserCourse.DoesNotExist:
            return Response({"error": "User course does not exist"}, status=status.HTTP_404_NOT_FOUND)

        try:
            course_cohort = CourseCohort.objects.get(
                id=request.data['course_cohort'])
        except CourseCohort.DoesNotExist:
            return Response({"error": "Course cohort does not exist"}, status=status.HTTP_404_NOT_FOUND)

        user_course.cohort = course_cohort
        user_course.save()
        return Response(UserCourseSerializer(user_course, context={'request': request}).data, status=status.HTTP_200_OK)


class DeleteCourseView(APIView):
    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def delete(self, request, course_id):
        try:
            course = Course.objects.get(id=course_id)
        except Course.DoesNotExist:
            return Response({"error": "Course does not exist"}, status=status.HTTP_404_NOT_FOUND)

        # Delete all related data
        UserCourse.objects.filter(course=course).delete()
        CourseWeeklyTopic.objects.filter(
            course_weekly_schedule__course=course).delete()
        CourseWeeklyReading.objects.filter(
            course_weekly_schedule__course=course).delete()
        CourseWeeklyAssessment.objects.filter(
            course_weekly_schedule__course=course).delete()
        CourseWeeklySchedule.objects.filter(course=course).delete()
        CourseTextbook.objects.filter(course=course).delete()
        CourseLectureDay.objects.filter(course_cohort__course=course).delete()
        CourseCohort.objects.filter(course=course).delete()
        CourseEvaluationCriteria.objects.filter(course=course).delete()
        CourseInstructorOfficeHour.objects.filter(
            course_instructor__course=course).delete()
        CourseInstructor.objects.filter(course=course).delete()

        # Delete course file from filesystem and database
        course_file = CourseFile.objects.filter(course=course).first()

        # remove file from filesystem
        if course_file.file != "":
            if os.path.exists(course_file.file.path):
                os.remove(course_file.file.path)
        course_file.delete()

        # Delete the course
        course.delete()

        return Response(status=status.HTTP_204_NO_CONTENT)


class DetermineTimeBlocksView(APIView):
    permission_classes = [IsAuthenticated, IsAccessTokenBlacklisted]

    def get(self, request):
        # retrieve all lecture days for the user's courses
        user_courses = UserCourse.objects.filter(user=request.user, course__is_completed=False)
        user_courses = UserCourseSerializer(user_courses, many=True).data
        lecture_days = []
        for user_course in user_courses:
            lecture_days.extend(user_course['cohort']['lecture_days'])
        
        # retrieve user's routines
        user_routines = UserRoutine.objects.filter(user=request.user)
        user_routines = UserRoutineSerializer(user_routines, many=True, context={'request': request}).data
        user_routines = get_extended_routine_data(user_routines)
        
        # retrieve user's metadata
        try:
            user_metadata = UserMetaData.objects.get(user=request.user)
        except UserMetaData.DoesNotExist:
            return Response({"error": "User metadata does not exist. It is required to generate time blocks."}, status=status.HTTP_404_NOT_FOUND)
        user_metadata = UserMetaDataSerializer(user_metadata).data

        # process the data to create free time slots
        free_slots = self.generate_free_slots(lecture_days, user_metadata, user_routines)

        # determine mini blocks from free slots
        mini_blocks = self.determine_mini_blocks(free_slots, user_metadata)

        return Response(mini_blocks, status=status.HTTP_200_OK)

    def generate_free_slots(self, lecture_days, user_metadata, user_routines):
        days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
        free_slots = {day: [] for day in days}
        wake_time = parse_time(user_metadata['wake_time'])
        sleep_time = parse_time(user_metadata['sleep_time'])

        for day in days:
            day_lectures = [lecture for lecture in lecture_days if lecture['day'].lower() == day]
            days_routines = [routine for routine in user_routines if routine['day'] == day]
            day_activities = day_lectures + days_routines

            if not day_activities:
                # if there are no lectures on this day, add the entire day as a free slot
                free_slots[day].append({
                    "start_time": wake_time.strftime("%H:%M:%S"),
                    "end_time": sleep_time.strftime("%H:%M:%S")
                })
            else:
                day_activities.sort(key=lambda x: parse_time(x['start_time']))
                current_time = wake_time

                for activity in day_activities:
                    activity_start = parse_time(activity['start_time'])
                    activity_end = parse_time(activity['end_time'])

                    if current_time < activity_start:
                        free_slots[day].append({
                            "start_time": current_time.strftime("%H:%M:%S"),
                            "end_time": activity_start.strftime("%H:%M:%S")
                        })
                    current_time = activity_end

                # add the final free slot from the end of the last lecture to sleep time
                if current_time < sleep_time:
                    free_slots[day].append({
                        "start_time": current_time.strftime("%H:%M:%S"),
                        "end_time": sleep_time.strftime("%H:%M:%S")
                    })

        return free_slots

    def determine_mini_blocks(self, free_slots, user_metadata):
        min_study_time = timedelta(hours=user_metadata['min_study_time'])
        max_study_time = timedelta(hours=user_metadata['max_study_time'])
        break_time_short = timedelta(minutes=30)
        break_time_long = timedelta(hours=1)
        min_block_length = timedelta(minutes=20)
        chain_spacing = timedelta(minutes=15)

        mini_blocks = {day: [] for day in free_slots}
        buffer_periods = [
            (parse_time("12:00:00"), parse_time("13:00:00")),
            (parse_time("18:00:00"), parse_time("20:00:00")),
        ]

        for day, slots in free_slots.items():
            for slot_index, slot in enumerate(slots):
                start_time = datetime.combine(datetime.today(), parse_time(slot["start_time"]))
                end_time = datetime.combine(datetime.today(), parse_time(slot["end_time"]))
                
                # Add chain spacing if it's not the first slot of the day
                if slot_index > 0:
                    start_time += chain_spacing
                
                current_time = start_time

                while current_time < end_time:
                    next_buffer = next((buffer for buffer in buffer_periods if buffer[0] <= current_time.time() < buffer[1]), None)

                    if next_buffer:
                        buffer_end = min(datetime.combine(datetime.today(), next_buffer[1]), end_time)
                        mini_blocks[day].append({
                            "start_time": current_time.time().strftime("%H:%M:%S"),
                            "end_time": buffer_end.time().strftime("%H:%M:%S"),
                            "label": "Buffer"
                        })
                        current_time = buffer_end
                        continue

                    # Determine the appropriate study time
                    remaining_time = end_time - current_time
                    print(f"Day: {day}, Remaining time: {remaining_time}")

                    if remaining_time < min_block_length:
                        break  # Skip if remaining time is less than 20 minutes
                    elif remaining_time >= (max_study_time + break_time_short):
                        print(f"Creating max study time block: {max_study_time}")
                        period = max_study_time
                    elif remaining_time >= min_study_time:
                        period = min(remaining_time, max_study_time)
                    else:
                        break  # Skip if remaining time is less than min_study_time

                    mini_block_end = current_time + period

                    mini_blocks[day].append({
                        "start_time": current_time.time().strftime("%H:%M:%S"),
                        "end_time": mini_block_end.time().strftime("%H:%M:%S"),
                        "label": "Free Slot"
                    })

                    print(f"Created block: {current_time.time()} - {mini_block_end.time()}")

                    current_time = mini_block_end

                    # If we've reached the end of the slot, break
                    if current_time >= end_time:
                        break

                    # Add a break between study blocks
                    break_period = break_time_short if len([b for b in mini_blocks[day] if b['label'] == 'Free Slot']) % 2 == 0 else break_time_long
                    current_time = min(current_time + break_period, end_time)

        return mini_blocks