from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (AccountRegistrationView, AccountLoginView, AccountView)

urlpatterns = [
    path("register/", AccountRegistrationView.as_view(), name="register-user"),
    path("login/", AccountLoginView.as_view(), name="login-user"),
    path("token/refresh/", TokenRefreshView.as_view(), name="refresh-access-token"),
    path("user", AccountView.as_view(), name="account-details"),
]