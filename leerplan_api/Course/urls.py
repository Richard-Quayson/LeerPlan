from django.urls import path
from .views import (
    CreateCourseView,
)

urlpatterns = [
    path('create/', CreateCourseView.as_view(), name='create-course'),
]