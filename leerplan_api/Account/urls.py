from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (AccountRegistrationView, AccountLoginView, AccountView,
                    UpdateAccountView, ChangePasswordView, AccountLogoutView)

urlpatterns = [
    path("register/", AccountRegistrationView.as_view(), name="register-user"),
    path("login/", AccountLoginView.as_view(), name="login-user"),
    path("token/refresh/", TokenRefreshView.as_view(), name="refresh-access-token"),
    path("user/", AccountView.as_view(), name="account-details"),
    path("user/update/", UpdateAccountView.as_view(), name="update-account"),
    path("password/change/", ChangePasswordView.as_view(), name="change-password"),
    path("logout/", AccountLogoutView.as_view(), name="logout-user"),
]