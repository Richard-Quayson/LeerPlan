from django.urls import path
from .views import (
    CreateCourseView, DeleteCourseView,
)

urlpatterns = [
    path('create/', CreateCourseView.as_view(), name='create-course'),
    path('delete/<int:course_id>/', DeleteCourseView.as_view(), name='delete-course'),
]