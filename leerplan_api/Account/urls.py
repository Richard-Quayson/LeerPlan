from django.urls import path
from .views import (AccountRegistrationView, AccountLoginView)

urlpatterns = [
    path("register/", AccountRegistrationView.as_view(), name="register-user"),
    path("login/", AccountLoginView.as_view(), name="login-user"),
]