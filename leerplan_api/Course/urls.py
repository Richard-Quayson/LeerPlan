from django.urls import path
from .views import (
    CreateCourseView, RetrieveUserCoursesView, SpecifyCourseCohortView, DeleteCourseView,
)

urlpatterns = [
    path('create/', CreateCourseView.as_view(), name='create-course'),
    path('user/', RetrieveUserCoursesView.as_view(), name='retrieve-user-courses'),
    path('cohort/specify/', SpecifyCourseCohortView.as_view(), name='specify-course-cohort'),
    path('delete/<int:course_id>/', DeleteCourseView.as_view(), name='delete-course'),
]