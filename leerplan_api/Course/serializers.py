from rest_framework import serializers
import re
from .models import (
    Semester, Instructor, InstructorType, Course, CourseInstructor, CourseInstructorOfficeHour, Day,
    CourseEvaluationCriteria, CourseLectureDay, CourseTextbook, TextbookType, CourseWeeklySchedule,
    CourseWeeklyAssessment, CourseWeeklyReading, CourseWeeklyTopic, CourseFile, UserCourse,
)
from Account.models import University, UserAccount
from Account.serializers import UniversitySerializer, UserDetailsSerializer
from Account.helper import NAME_REGEX, EMAIL_REGEX


class SemesterSerializer(serializers.ModelSerializer):

    class Meta:
        model = Semester
        fields = ['id', 'name', 'year', 'university', 'is_completed']

    def validate_name(self, value:  str) -> str:
        if len(value) > 100:
            raise serializers.ValidationError("Semester name too long! Maximum of 100 characters allowed.")
        return value
    
    def validate_year(self, value: int) -> int:
        if len(str(value)) != 4:
            raise serializers.ValidationError("Invalid year!")
        return value
    
    def validate_university(self, value: University) -> University:
        if not University.objects.filter(id=value.id).exists():
            raise serializers.ValidationError("University does not exist!")
        return value
    
    def validate(self, attrs: dict) -> dict:
        if Semester.objects.filter(name=attrs['name'], year=attrs['year'], university=attrs['university']).exists():
            raise serializers.ValidationError("Semester already exists!")
        
        # a semester is not completed by default
        # it is only completed if all courses running in the semester are completed
        if 'is_completed' not in attrs:
            attrs['is_completed'] = False

        return attrs
    
    def update(self, instance: Semester, validated_data: dict) -> Semester:
        instance.name = validated_data.get('name', instance.name)
        instance.year = validated_data.get('year', instance.year)
        instance.university = validated_data.get('university', instance.university)
        instance.is_completed = validated_data.get('is_completed', False)
        instance.save()
        return instance



class InstructorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Instructor
        fields = ['id', 'name', 'email', 'phone', 'type']

    def validate_name(self, value: str) -> str:
        if not re.match(NAME_REGEX, value):
            raise serializers.ValidationError("Invalid instructor name!")
        return value
    
    def validate_email(self, value: str) -> str:
        if not re.match(EMAIL_REGEX, value):
            raise serializers.ValidationError("Invalid instructor email!")
        
        if Instructor.objects.filter(email=value).exists():
            raise serializers.ValidationError("Instructor with email already exists!")
        
        return value
    
    def validate_phone(self, value: str) -> str:
        if value and len(value) > 15:
            raise serializers.ValidationError("Phone number too long!")
        
        if value and Instructor.objects.filter(phone=value).exists():
            raise serializers.ValidationError("Instructor with phone number already exists!")
        
        return value
    
    def validate_type(self, value: str) -> str:
        if value not in InstructorType.values:
            raise serializers.ValidationError("Invalid instructor type!")
        
        if len(value) > 25:
            raise serializers.ValidationError("Instructor type too long!")
        
        return value
    
    def to_representation(self, instance: Instructor) -> dict:
        representation = super().to_representation(instance)
        
        # add instructor type details to the representation
        representation['type'] = InstructorType(instance.type).label

        # add instructor courses to the representation
        representation['courses'] = []
        courses = CourseInstructor.objects.filter(instructor=instance)
        for course_taught in courses:
            representation['courses'].append(
                {
                    'id': course_taught.course.id,
                    'name': course_taught.course.name,
                    'code': course_taught.course.code,
                    'university': course_taught.course.university.id,
                    'semester': course_taught.course.semester.id,
                }
            )
        
        return representation
    

class CourseSerializer(serializers.ModelSerializer):

    class Meta:
        model = Course
        fields = ['id', 'name', 'code', 'description', 'university', 
                  'semester', 'date_created', 'date_updated', 'is_completed']
        
    def validate_name(self, value: str) -> str:
        if len(value) > 255:
            raise serializers.ValidationError("Course name too long!")
        return value
    
    def validate_code(self, value: str) -> str:
        if len(value) > 10:
            raise serializers.ValidationError("Course code too long!")
        return value
    
    def validate_university(self, value: University) -> University:
        if not University.objects.filter(id=value.id).exists():
            raise serializers.ValidationError("University does not exist!")
        return value
    
    def validate_semester(self, value: Semester) -> Semester:
        if not Semester.objects.filter(id=value.id).exists():
            raise serializers.ValidationError("Semester does not exist!")
        
        if Semester.objects.get(id=value.id).is_completed:
            raise serializers.ValidationError("You cannot add a course to a completed semester!")
        
        return value
    
    def validate(self, attrs: dict) -> dict:
        # a course already exists if the course name, code, university, and semester are the same
        if Course.objects.filter(name=attrs['name'], code=attrs['code'], university=attrs['university'], 
                                 semester=attrs['semester']).exists():
            raise serializers.ValidationError("Course already exists!")
        
        # a course is not completed by default
        # it is only completed if the last week of the course is completed
        if 'is_completed' not in attrs:
            attrs['is_completed'] = False
        
        return attrs
    
    def update(self, instance: Course, validated_data: dict) -> Course:
        instance.name = validated_data.get('name', instance.name)
        instance.code = validated_data.get('code', instance.code)
        instance.description = validated_data.get('description', instance.description)
        instance.university = validated_data.get('university', instance.university)
        instance.semester = validated_data.get('semester', instance.semester)
        instance.save()
        return instance
    
    def to_representation(self, instance: Course) -> dict:
        representation = super().to_representation(instance)

        # add semester details to the representation
        semester = SemesterSerializer(Semester.objects.get(id=instance.semester.id)).data
        representation['semester'] = semester

        # add university details to the representation
        university =  UniversitySerializer(University.objects.get(id=instance.university.id)).data
        representation['university'] = university

        # add add course instructors to the representation
        representation['instructors'] = []
        instructors = CourseInstructor.objects.filter(course=instance)
        for instructor in instructors:
            data = CourseInstructorSerializer(instructor).data
            representation['instructors'].append(data)

        # add course evaluation criteria to the representation
        representation['evaluation_criteria'] = []
        evaluation_criteria = CourseEvaluationCriteria.objects.filter(course=instance)
        for criteria in evaluation_criteria:
            data = CourseEvaluationCriteriaSerializer(criteria).data
            representation['evaluation_criteria'].append(data)

        # add course lecture days to the representation
        representation['lecture_days'] = []
        lecture_days = CourseLectureDay.objects.filter(course=instance)
        for lecture_day in lecture_days:
            data = CourseLectureDaySerializer(lecture_day).data
            representation['lecture_days'].append(data)

        # add course textbooks to the representation
        representation['textbooks'] = []
        textbooks = CourseTextbook.objects.filter(course=instance)
        for textbook in textbooks:
            data = CourseTextbookSerializer(textbook).data
            representation['textbooks'].append(data)

        # add course weekly schedules to the representation
        representation['weekly_schedules'] = []
        weekly_schedules = CourseWeeklySchedule.objects.filter(course=instance)
        for weekly_schedule in weekly_schedules:
            data = CourseWeeklyScheduleSerializer(weekly_schedule).data
            representation['weekly_schedules'].append(data)

        return representation
    

class CourseInstructorSerializer(serializers.ModelSerializer):

    class Meta:
        model = CourseInstructor
        fields = ['id', 'course', 'instructor']

    def validate_course(self, value: Course) -> Course:
        if not Course.objects.filter(id=value.id).exists():
            raise serializers.ValidationError("Course does not exist!")
        
        if Course.objects.get(id=value.id).is_completed:
            raise serializers.ValidationError("You cannot assign an instructor to a completed course!")
        
        return value
    
    def validate_instructor(self, value: Instructor) -> Instructor:
        if not Instructor.objects.filter(id=value.id).exists():
            raise serializers.ValidationError("Instructor does not exist!")
        return value
    
    def validate(self, attrs: dict) -> dict:
        if CourseInstructor.objects.filter(course=attrs['course'], instructor=attrs['instructor']).exists():
            raise serializers.ValidationError("Course instructor already exists!")
        return attrs
    
    def to_representation(self, instance: CourseInstructor) -> dict:
        representation = super().to_representation(instance)
        
        # add instructor details to the representation
        instructor = InstructorSerializer(Instructor.objects.get(id=instance.instructor.id)).data
        representation['instructor'] = instructor

        # add course instructor office hours to the representation
        representation['office_hours'] = []
        office_hours = CourseInstructorOfficeHour.objects.filter(course_instructor=instance)
        for office_hour in office_hours:
            data = CourseInstructorOfficeHourSerializer(office_hour).data
            representation['office_hours'].append(data)
        
        return representation
    

class CourseInstructorOfficeHourSerializer(serializers.ModelSerializer):

    class Meta:
        model = CourseInstructorOfficeHour
        fields = ['id', 'course_instructor', 'day', 'start_time', 'end_time']

    def validate_course_instructor(self, value: CourseInstructor) -> CourseInstructor:
        if not CourseInstructor.objects.filter(id=value.id).exists():
            raise serializers.ValidationError("Course instructor does not exist!")
        return value
    
    def validate_day(self, value: str) -> str:
        if len(value) > 10:
            raise serializers.ValidationError("Day too long!")
        
        if value not in Day.values:
            raise serializers.ValidationError("Invalid day!")
        
        return value
    
    def validate_start_time(self, value) -> str:
        try:
            value.strftime("%H:%M:%S")
        except ValueError:
            raise serializers.ValidationError("Incorrect time format, should be HH:MM:SS")
        
        return value
    
    def validate_end_time(self, value) -> str:
        try:
            value.strftime("%H:%M:%S")
        except ValueError:
            raise serializers.ValidationError("Incorrect time format, should be HH:MM:SS")
        
        return value
    
    def validate(self, attrs: dict) -> dict:
        if attrs['start_time'] >= attrs['end_time']:
            raise serializers.ValidationError("Start time must be less than end time!")

        if CourseInstructorOfficeHour.objects.filter(course_instructor=attrs['course_instructor'], day=attrs['day'],
                                                    start_time=attrs['start_time'], end_time=attrs['end_time']).exists():
            raise serializers.ValidationError("Course instructor office hour already exists!")
        
        return attrs


class CourseEvaluationCriteriaSerializer(serializers.ModelSerializer):

    class Meta:
        model = CourseEvaluationCriteria
        fields = ['id', 'course', 'type', 'weight']

    def validate_course(self, value: Course) -> Course:
        if not Course.objects.filter(id=value.id).exists():
            raise serializers.ValidationError("Course does not exist!")
        
        if Course.objects.get(id=value.id).is_completed:
            raise serializers.ValidationError("You cannot add evaluation criteria to a completed course!")
        
        return value
    
    def validate_type(self, value: str) -> str:
        if len(value) > 100:
            raise serializers.ValidationError("Evaluation criteria type too long!")
        return value
    
    def validate_weight(self, value: float) -> float:
        if value < 0:
            raise serializers.ValidationError("Invalid weight! Weight must be greater than 0.0")
        return value
    
    def validate(self, attrs: dict) -> dict:
        if CourseEvaluationCriteria.objects.filter(course=attrs['course'], type=attrs['type']).exists():
            raise serializers.ValidationError("Evaluation criteria already exists!")
        return attrs
    

class CourseLectureDaySerializer(serializers.ModelSerializer):

    class Meta:
        model = CourseLectureDay
        fields = ['id', 'course', 'day', 'location', 'start_time', 'end_time']
    
    def validate_course(self, value: Course) -> Course:
        if not Course.objects.filter(id=value.id).exists():
            raise serializers.ValidationError("Course does not exist!")
        
        if Course.objects.get(id=value.id).is_completed:
            raise serializers.ValidationError("You cannot add lecture days to a completed course!")
        
        return value
    
    def validate_day(self, value: str) -> str:
        if len(value) > 10:
            raise serializers.ValidationError("Day too long!")
        
        if value not in Day.values:
            raise serializers.ValidationError("Invalid day!")
        
        return value
    
    def validate_start_time(self, value) -> str:
        try:
            value.strftime("%H:%M:%S")
        except ValueError:
            raise serializers.ValidationError("Incorrect time format, should be HH:MM:SS")
        
        return value
    
    def validate_end_time(self, value) -> str:
        try:
            value.strftime("%H:%M:%S")
        except ValueError:
            raise serializers.ValidationError("Incorrect time format, should be HH:MM:SS")
        
        return value
    
    def validate(self, attrs: dict) -> dict:
        if attrs['start_time'] >= attrs['end_time']:
            raise serializers.ValidationError("Start time must be less than end time!")

        if CourseLectureDay.objects.filter(course=attrs['course'], day=attrs['day'],
                                           start_time=attrs['start_time'], end_time=attrs['end_time']).exists():
            raise serializers.ValidationError("Course lecture day already exists!")
        
        return attrs
    

class CourseTextbookSerializer(serializers.ModelSerializer):

    class Meta:
        model = CourseTextbook
        fields = ['id', 'course', 'title', 'type']

    def validate_course(self, value: Course) -> Course:
        if not Course.objects.filter(id=value.id).exists():
            raise serializers.ValidationError("Course does not exist!")
        
        if Course.objects.get(id=value.id).is_completed:
            raise serializers.ValidationError("You cannot add textbooks to a completed course!")
        
        return value
    
    def validate_title(self, value: str) -> str:
        if len(value) > 255:
            raise serializers.ValidationError("Textbook title too long!")
        return value
    
    def validate_type(self, value: str) -> str:
        if value not in TextbookType.values:
            raise serializers.ValidationError("Invalid textbook type!")
        return value
    
    def validate(self, attrs: dict) -> dict:
        if CourseTextbook.objects.filter(course=attrs['course'], title=attrs['title']).exists():
            raise serializers.ValidationError("Textbook already exists!")
        return attrs
    

class CourseWeeklyScheduleSerializer(serializers.ModelSerializer):

    class Meta:
        model = CourseWeeklySchedule
        fields = ['id', 'course', 'week_number', 'type', 'start_date', 'end_date']

    def validate_course(self, value: Course) -> Course:
        if not Course.objects.filter(id=value.id).exists():
            raise serializers.ValidationError("Course does not exist!")
        
        if Course.objects.get(id=value.id).is_completed:
            raise serializers.ValidationError("You cannot add weekly schedules to a completed course!")
        
        return value
    
    def validate_week_number(self, value: int) -> int:
        if value < 1:
            raise serializers.ValidationError("Invalid week number! Week number must be greater than 0")
        return value
    
    def validate_type(self, value: str) -> str:
        if len(value) > 100:
            raise serializers.ValidationError("Weekly schedule type too long!")
        return value
    
    def validate_start_date(self, value):
        try:
            value.strftime("%Y-%m-%d")
        except ValueError:
            raise serializers.ValidationError("Incorrect date format, should be YYYY-MM-DD")
        
        return value
    
    def validate_end_date(self, value):
        try:
            value.strftime("%Y-%m-%d")
        except ValueError:
            raise serializers.ValidationError("Incorrect date format, should be YYYY-MM-DD")
        
        return value
    
    def validate(self, attrs: dict) -> dict:
        if attrs['start_date'] and attrs['end_date'] and attrs['start_date'] >= attrs['end_date']:
            raise serializers.ValidationError("Start date must be less than end date!")

        if CourseWeeklySchedule.objects.filter(course=attrs['course'], week_number=attrs['week_number']).exists():
            raise serializers.ValidationError("Weekly schedule already exists!")
        return attrs
    
    def to_representation(self, instance: CourseWeeklySchedule) -> dict:
        representation = super().to_representation(instance)

        # add course weekly assessments to the representation
        representation['weekly_assessments'] = []
        weekly_assessments = CourseWeeklyAssessment.objects.filter(course_weekly_schedule=instance)
        for weekly_assessment in weekly_assessments:
            data = CourseWeeklyAssessmentSerializer(weekly_assessment).data
            representation['weekly_assessments'].append(data)

        # add course weekly readings to the representation
        representation['weekly_readings'] = []
        weekly_readings = CourseWeeklyReading.objects.filter(course_weekly_schedule=instance)
        for weekly_reading in weekly_readings:
            data = CourseWeeklyReadingSerializer(weekly_reading).data
            representation['weekly_readings'].append(data)

        # add course weekly topics to the representation
        representation['weekly_topics'] = []
        weekly_topics = CourseWeeklyTopic.objects.filter(course_weekly_schedule=instance)
        for weekly_topic in weekly_topics:
            data = CourseWeeklyTopicSerializer(weekly_topic).data
            representation['weekly_topics'].append(data)

        return representation
    

class CourseWeeklyAssessmentSerializer(serializers.ModelSerializer):

    class Meta:
        model = CourseWeeklyAssessment
        fields = ['id', 'course_weekly_schedule', 'name', 'type', 'weight', 'due_date']

    def validate_course_weekly_schedule(self, value: CourseWeeklySchedule) -> CourseWeeklySchedule:
        if not CourseWeeklySchedule.objects.filter(id=value.id).exists():
            raise serializers.ValidationError("Course weekly schedule does not exist!")
        return value
    
    def validate_name(self, value: str) -> str:
        if len(value) > 100:
            raise serializers.ValidationError("Assessment name too long!")
        return value
    
    def validate_type(self, value: str) -> str:
        if len(value) > 50:
            raise serializers.ValidationError("Assessment type too long!")
        return value
    
    def validate_weight(self, value: float) -> float:
        if value < 0:
            raise serializers.ValidationError("Invalid weight! Weight must be greater than 0.0")
        return value
    
    def validate_due_date(self, value) -> str:
        try:
            value.strftime("%Y-%m-%d")
        except ValueError:
            raise serializers.ValidationError("Incorrect date format, should be YYYY-MM-DD")
        
        return value
    
    def validate(self, attrs: dict) -> dict:
        if CourseWeeklyAssessment.objects.filter(course_weekly_schedule=attrs['course_weekly_schedule'], name=attrs['name']).exists():
            raise serializers.ValidationError("Weekly assessment already exists!")
        return attrs
    

class CourseWeeklyReadingSerializer(serializers.ModelSerializer):

    class Meta:
        model = CourseWeeklyReading
        fields = ['id', 'course_weekly_schedule', 'chapter']
    
    def validate_course_weekly_schedule(self, value: CourseWeeklySchedule) -> CourseWeeklySchedule:
        if not CourseWeeklySchedule.objects.filter(id=value.id).exists():
            raise serializers.ValidationError("Course weekly schedule does not exist!")
        return value
    
    def validate_chapter(self, value: str) -> str:
        if len(value) > 255:
            raise serializers.ValidationError("Chapter name too long!")
        return value
    
    def validate(self, attrs: dict) -> dict:
        if CourseWeeklyReading.objects.filter(course_weekly_schedule=attrs['course_weekly_schedule'], chapter=attrs['chapter']).exists():
            raise serializers.ValidationError("Weekly reading already exists!")
        return attrs
    

class CourseWeeklyTopicSerializer(serializers.ModelSerializer):

    class Meta:
        model = CourseWeeklyTopic
        fields = ['id', 'course_weekly_schedule', 'topic']
    
    def validate_course_weekly_schedule(self, value: CourseWeeklySchedule) -> CourseWeeklySchedule:
        if not CourseWeeklySchedule.objects.filter(id=value.id).exists():
            raise serializers.ValidationError("Course weekly schedule does not exist!")
        return value
    
    def validate_topic(self, value: str) -> str:
        if len(value) > 255:
            raise serializers.ValidationError("Topic name too long!")
        return value
    
    def validate(self, attrs: dict) -> dict:
        if CourseWeeklyTopic.objects.filter(course_weekly_schedule=attrs['course_weekly_schedule'], topic=attrs['topic']).exists():
            raise serializers.ValidationError("Weekly topic already exists!")
        return attrs
    

class CourseFileSerializer(serializers.ModelSerializer):

    class Meta:
        model = CourseFile
        fields = ['id', 'course', 'file', 'date_uploaded']
    
    def validate_course(self, value: Course) -> Course:
        if not Course.objects.filter(id=value.id).exists():
            raise serializers.ValidationError("Course does not exist!")
                
        return value
    
    # change to PDF after integrating AI
    def validate_file(self, value) -> str:
        if not value.name.endswith('.json'):
            raise serializers.ValidationError("Invalid file format! Only JSON files allowed.")
        return value


class UserCourseSerializer(serializers.ModelSerializer):

    class Meta:
        model = UserCourse
        fields = ['id', 'course', 'user']

    def validate_course(self, value: Course) -> Course:
        if not Course.objects.filter(id=value.id).exists():
            raise serializers.ValidationError("Course does not exist!")
        
        if Course.objects.get(id=value.id).is_completed:
            raise serializers.ValidationError("You cannot assign a user to a completed course!")
        
        return value
    
    def validate_user(self, value: UserAccount) -> UserAccount:
        if not UserAccount.objects.filter(id=value.id).exists():
            raise serializers.ValidationError("User does not exist!")
        return value
    
    def validate(self, attrs: dict) -> dict:
        if UserCourse.objects.filter(course=attrs['course'], user=attrs['user']).exists():
            raise serializers.ValidationError("User course already exists!")
        return attrs
    
    def to_representation(self, instance: UserCourse) -> dict:
        representation = super().to_representation(instance)
        
        # add user details to the representation
        user = UserDetailsSerializer(UserAccount.objects.get(id=instance.user.id)).data
        representation['user'] = user

        # add course details to the representation
        course = CourseSerializer(Course.objects.get(id=instance.course.id), context={'request': self.context.get('request')}).data
        representation['course'] = course
        
        return representation