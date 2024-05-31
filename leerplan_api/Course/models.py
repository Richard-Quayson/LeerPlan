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