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