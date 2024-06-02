from rest_framework import serializers
from .models import (
    Semester, 
)
from Account.models import University
from Account.helper import NAME_REGEX


class SemesterSerializer(serializers.ModelSerializer):
    class Meta:
        model = Semester
        fields = ['id', 'name', 'year', 'university']

    def validate_name(self, value):
        if not NAME_REGEX.match(value):
            raise serializers.ValidationError("Invalid university name!")
        return value
    
    def validate_year(self, value):
        if len(str(value)) != 4:
            raise serializers.ValidationError("Invalid year!")
        return value
    
    def validate_university(self, value):
        if not University.objects.filter(id=value).exists():
            raise serializers.ValidationError("University does not exist!")
        return value
    
    def validate(self, attrs):
        if Semester.objects.filter(name=attrs['name'], year=attrs['year'], university=attrs['university']).exists():
            raise serializers.ValidationError("Semester already exists!")
        return attrs
    
    def update(self, instance, validated_data):
        instance.name = validated_data.get('name', instance.name)
        instance.year = validated_data.get('year', instance.year)
        instance.university = validated_data.get('university', instance.university)
        instance.save()
        return instance