from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    AccountRegistrationView, AccountLoginView, AccountView, UpdateAccountView, 
    ChangePasswordView, AccountLogoutView,
    RetrieveUniversitiesView, UpdateUniversityView, AddUserUniversityView,
    RemoveUserUniversityView, RetrieveUserUniversitiesView
)

urlpatterns = [
    # ACCOUNT ENDPOINTS
    path("register/", AccountRegistrationView.as_view(), name="register-user"),
    path("login/", AccountLoginView.as_view(), name="login-user"),
    path("token/refresh/", TokenRefreshView.as_view(), name="refresh-access-token"),
    path("user/", AccountView.as_view(), name="account-details"),
    path("update/", UpdateAccountView.as_view(), name="update-account"),
    path("password/change/", ChangePasswordView.as_view(), name="change-password"),
    path("logout/", AccountLogoutView.as_view(), name="logout-user"),

    # UNIVERSITY ENDPOINTS
    path("universities/", RetrieveUniversitiesView.as_view(), name="retrieve-universities"),
    path("university/update/", UpdateUniversityView.as_view(), name="update-university"),
    path("user/university/add/", AddUserUniversityView.as_view(), name="add-user-university"),
    path("user/university/remove/", RemoveUserUniversityView.as_view(), name="remove-user-university"),
    path("user/universities/", RetrieveUserUniversitiesView.as_view(), name="retrieve-user-universities"),
]