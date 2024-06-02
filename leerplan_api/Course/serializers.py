from rest_framework import serializers
import re
from .models import (
    Semester, Instructor, InstructorType, Course, CourseInstructor, CourseInstructorOfficeHour, Day,
)
from Account.models import University
from Account.serializers import UniversitySerializer
from Account.helper import NAME_REGEX, EMAIL_REGEX


class SemesterSerializer(serializers.ModelSerializer):

    class Meta:
        model = Semester
        fields = ['id', 'name', 'year', 'university', 'is_completed']

    def validate_name(self, value:  str) -> str:
        if len(value) > 100:
            raise serializers.ValidationError("Semester name too long! Maximum of 100 characters allowed.")
        
        if not re.match(NAME_REGEX, value):
            raise serializers.ValidationError("Invalid university name!")
        return value
    
    def validate_year(self, value: int) -> int:
        if len(str(value)) != 4:
            raise serializers.ValidationError("Invalid year!")
        return value
    
    def validate_university(self, value: int) -> int:
        if not University.objects.filter(id=value).exists():
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
    
    def validate_university(self, value: int) -> int:
        if not University.objects.filter(id=value).exists():
            raise serializers.ValidationError("University does not exist!")
        return value
    
    def validate_semester(self, value: int) -> int:
        if not Semester.objects.filter(id=value).exists():
            raise serializers.ValidationError("Semester does not exist!")
        
        if Semester.objects.get(id=value).is_completed:
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

        # add university details to the representation
        university =  UniversitySerializer(University.objects.get(id=instance.university.id)).data
        representation['university'] = university

        # add add course instructors to the representation
        representation['instructors'] = []
        instructors = CourseInstructor.objects.filter(course=instance)
        for instructor in instructors:
            data = CourseInstructorSerializer(instructor).data
            representation['instructors'].append(data)

        return representation
    

class CourseInstructorSerializer(serializers.ModelSerializer):

    class Meta:
        model = CourseInstructor
        fields = ['id', 'course', 'instructor']

    def validate_course(self, value: int) -> int:
        if not Course.objects.filter(id=value).exists():
            raise serializers.ValidationError("Course does not exist!")
        
        if Course.objects.get(id=value).is_completed:
            raise serializers.ValidationError("You cannot assign an instructor to a completed course!")
        
        return value
    
    def validate_instructor(self, value: int) -> int:
        if not Instructor.objects.filter(id=value).exists():
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

    def validate_course_instructor(self, value: int) -> int:
        if not CourseInstructor.objects.filter(id=value).exists():
            raise serializers.ValidationError("Course instructor does not exist!")
        return value
    
    def validate_day(self, value: str) -> str:
        if len(value) > 10:
            raise serializers.ValidationError("Day too long!")
        
        if value not in Day.values:
            raise serializers.ValidationError("Invalid day!")
        
        return value
    
    def validate(self, attrs: dict) -> dict:
        if attrs['start_time'] >= attrs['end_time']:
            raise serializers.ValidationError("Start time must be less than end time!")

        if CourseInstructorOfficeHour.objects.filter(course_instructor=attrs['course_instructor'], day=attrs['day'],
                                                    start_time=attrs['start_time'], end_time=attrs['end_time']).exists():
            raise serializers.ValidationError("Course instructor office hour already exists!")
        
        return attrs