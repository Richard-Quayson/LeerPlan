from django.urls import path
from .views import (AccountRegistrationView, )

urlpatterns = [
    path("register/", AccountRegistrationView.as_view(), name="register-user"),
]