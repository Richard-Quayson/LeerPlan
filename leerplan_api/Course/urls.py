from django.urls import path
from .views import (
    CreateCourseView, RetrieveUserCoursesView, DeleteCourseView,
)

urlpatterns = [
    path('create/', CreateCourseView.as_view(), name='create-course'),
    path('user/', RetrieveUserCoursesView.as_view(), name='retrieve-user-courses'),
    path('delete/<int:course_id>/', DeleteCourseView.as_view(), name='delete-course'),
]