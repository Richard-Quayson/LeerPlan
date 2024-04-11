import re
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth.password_validation import validate_password

from .models import UserAccount
from .helper import NAME_REGEX, EMAIL_REGEX, PASSWORD_REGEX


class AccountRegistrationSerializer(serializers.ModelSerializer):
    """
        serializer class to handle user registration
    """

    password = serializers.CharField(write_only=True, required=True)
    confirm_password = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = UserAccount
        fields = ['firstname', 'lastname', 'email', 'major', 'password','confirm_password', 'date_joined']

    def validate_firsname(self, value:str) -> str:
        """
            method to validate the first name
        """

        if not re.match(NAME_REGEX, value):
            raise serializers.ValidationError("First name must contain only alphabets, hyphens and spaces!")

        return value
    
    def validate_lastname(self, value:str) -> str:
        """
            method to validate the last name
        """

        if not re.match(NAME_REGEX, value):
            raise serializers.ValidationError("Last name must contain only alphabets, hyphens and spaces!")

        return value
    
    def validate_email(self, value:str) -> str:
        """
            method to validate the email
        """

        if not re.match(EMAIL_REGEX, value):
            raise serializers.ValidationError("Invalid email format!")

        return value
    
    def validate_password(self, value:str) -> str:
        """
            method to validate the password
        """

        if not re.match(PASSWORD_REGEX, value):
            raise serializers.ValidationError("Password must contain at least 2 uppercase letters, 2 lowercase letters, 2 digits and 2 special characters!")

        return value
    
    def validate_confirm_password(self, value:str) -> str:
        """
            method to validate the confirm password
        """

        if not re.match(PASSWORD_REGEX, value):
            raise serializers.ValidationError("Password must contain at least 2 uppercase letters, 2 lowercase letters, 2 digits and 2 special characters!")
        
        return value
    
    def create(self, validated_data:dict) -> object:
        """
            method to create a user account
        """

        # create the user account
        return UserAccount.objects.create(**validated_data)
    
    def save(self):
        """
            method to save the user account
        """

        # create the user account
        user = UserAccount(
            firstname=self.validated_data['firstname'],
            lastname=self.validated_data['lastname'],
            email=self.validated_data['email'],
            major=self.validated_data['major']
        )

        # ensure the password and confirm password match
        if self.validated_data['password'] != self.validated_data['confirm_password']:
            raise serializers.ValidationError("Passwords do not match!")

        # set the password
        user.set_password(self.validated_data['password'])
        user.save()
        return user


class UserAccountSerializer(serializers.ModelSerializer):

    class Meta:
        model = UserAccount
        fields = ['id', 'firstname', 'lastname', 'email', 'major', 'date_joined']


class AccountLoginSerializer(TokenObtainPairSerializer):
    """
        serializer class to handle user login with email and password
    """

