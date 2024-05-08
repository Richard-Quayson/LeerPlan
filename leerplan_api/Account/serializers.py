import re
from contextvars import Token
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
        fields = ['firstname', 'lastname', 'email', 'major', 'password','confirm_password', 'profile_picture', 'date_joined']

    def validate_firsname(self, value:str) -> str:
        """
            method to validate the first name from request body
        """

        if not re.match(NAME_REGEX, value):
            raise serializers.ValidationError("First name must contain only alphabets, hyphens and spaces!")

        return value
    
    def validate_lastname(self, value:str) -> str:
        """
            method to validate the last name from request body
        """

        if not re.match(NAME_REGEX, value):
            raise serializers.ValidationError("Last name must contain only alphabets, hyphens and spaces!")

        return value
    
    def validate_email(self, value:str) -> str:
        """
            method to validate the email from request body
        """

        if not re.match(EMAIL_REGEX, value):
            raise serializers.ValidationError("Invalid email format!")

        return value
    
    def validate_password(self, value:str) -> str:
        """
            method to validate the password from request body
        """

        if not re.match(PASSWORD_REGEX, value):
            raise serializers.ValidationError("Password must contain at least 2 uppercase letters, 2 lowercase letters, 2 digits and 2 special characters!")

        return value
    
    def validate_confirm_password(self, value:str) -> str:
        """
            method to validate the confirm password from request body
        """

        if not re.match(PASSWORD_REGEX, value):
            raise serializers.ValidationError("Password must contain at least 2 uppercase letters, 2 lowercase letters, 2 digits and 2 special characters!")
        
        return value
    
    def validate(self, attrs:dict) -> dict:
        """
            method to validate the request body
        """
        # ensure profile picture is an image
        if 'profile_picture' in attrs:
            if not attrs['profile_picture'].name.endswith(('.jpg', '.jpeg', '.png')):
                raise serializers.ValidationError("Profile picture must be an image!")
            
            # ensure profile picture does not already exist
            if UserAccount.objects.filter(profile_picture=attrs['profile_picture']).exists():
                raise serializers.ValidationError("Profile picture already exists!")
            
        return attrs
    
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
        fields = ['id', 'firstname', 'lastname', 'email', 'major', 'profile_picture', 'date_joined']


class AccountLoginSerializer(TokenObtainPairSerializer):
    """
        serializer class to handle user login with email and password
    """

    email = serializers.EmailField(required=True, validators=[EMAIL_REGEX], label="email",
                                   trim_whitespace=False, style={"input_type": "email"})
    password = serializers.CharField(write_only=True, required=True, trim_whitespace=False,
                                     label="password", style={"input_type": "password"}, validators=[PASSWORD_REGEX])
    token = serializers.SerializerMethodField("generate_token")

    class Meta:
        model = UserAccount
        fields = ["email", "password", "token"]
    
    @classmethod
    def generate_token(cls, account:UserAccount) -> Token:
        token = super().get_token(account)

        # add user's firstname and lastname to token payload
        token["firstname"] = account.firstname
        token["lastname"] = account.lastname

        return token
    
    def validate_email(self, value: str) -> str:
        if re.match(EMAIL_REGEX, value):
            return value
        
        return serializers.SerializerMethodField("Invalid email address!")
    
    def validate_password(self, value: str) -> str:
        if re.match(PASSWORD_REGEX, value):
            return value
        
        return serializers.SerializerMethodField("Invalid password format!")
    
    def validate(self, attrs: dict) -> dict:
        email = attrs.get("email")
        password = attrs.get("password")

        try:
            user = UserAccount.objects.get(email=email)
        except UserAccount.DoesNotExist:
            return serializers.ValidationError(f"User account with email {email} does not exist!")
        
        # ensure password is correct
        if not user.check_password(password):
            serializers.SerializerMethodField("Incorrect password!")

        # ensure account has not been disabled
        if not user.is_active:
            return serializers.ValidationError(f"Sorry, the user account with email {email} has been disabled.
                                               Please contact the admin to resolve it!")

        # generate access and refresh tokens
        token = self.generate_token(user)
        user_data = UserAccountSerializer(user).data
        user_data["refresh_data"] = str(token)
        user_data["access_data"] = str(token.access_token)
        
        return user_data


class ChangePasswordSerializer(serializers.Serializer):

    current_password = serializers.CharField(required=True, write_only=True)
    new_password = serializers.CharField(required=True, write_only=True)
    confirm_password = serializers.CharField(required=True, write_only=True)

    def validate_current_password(self, value: str) -> str:
        
        if not re.match(PASSWORD_REGEX, value):
            raise serializers.ValidationError("Invalid password format!")
        
        user = self.context["request"].user
        if not user.check_password(value):
            return serializers.ValidationError("Current password is incorrect!")
        
        return value
    
    def validate_new_password(self, value: str) -> str:
        if re.match(PASSWORD_REGEX, value):
            return value
        
        return serializers.ValidationError("Invalid password format!")
    
    def validate_confirm_password(self, value: str) -> str:
        if re.match(PASSWORD_REGEX, value):
            return value
        
        return serializers.ValidationError("Invalid password format!")
    
    def validate(self, attrs: dict) -> dict:
        current_password = attrs.get("current_password")
        new_password = attrs.get("new_password")
        confirm_password = attrs.get("confirm_password")

        # ensure new password matches confirm password
        if new_password != confirm_password:
            raise serializers.ValidationError("New passwords must match!")
        
        # ensure new password is different from current password
        if current_password == new_password:
            raise serializers.ValidationError("New password cannot be the same as current password!")
        
        validate_password(password=new_password, user=self.context["request"].user)
        return attrs
    
    def update(self, instance: UserAccount, validated_data: dict) -> UserAccount:
        user = self.context["request"].user

        # ensure authenticated user is the account owner
        if user != instance:
            raise serializers.ValidationError("You do not have permission to update this user account!")
        
        instance.set_password(validated_data.get("new_password"))
        instance.save()
        return instance