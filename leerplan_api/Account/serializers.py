import re
from contextvars import Token
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth.password_validation import validate_password

from .models import UserAccount, University, UserUniversity, UserRoutine
from .helper import NAME_REGEX, EMAIL_REGEX, PASSWORD_REGEX


class AccountRegistrationSerializer(serializers.ModelSerializer):
    """
        serializer class to handle user registration
    """

    password = serializers.CharField(write_only=True, required=True)
    confirm_password = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = UserAccount
        fields = ['firstname', 'lastname', 'email', 'password','confirm_password', 'profile_picture', 'date_joined']

    def validate_firstname(self, value:str) -> str:
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
            raise serializers.ValidationError("Password must be at least 8 characters and contain at least 1 uppercase letter, 1 lowercase letter, 1 digit and 1 special character!")

        return value
    
    def validate_confirm_password(self, value:str) -> str:
        """
            method to validate the confirm password from request body
        """

        if not re.match(PASSWORD_REGEX, value):
            raise serializers.ValidationError("Password must be at least 8 characters and contain at least 1 uppercase letter, 1 lowercase letter, 1 digit and 1 special character!")
        
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
        fields = ['id', 'firstname', 'lastname', 'email', 'profile_picture', 'date_joined']


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
            return serializers.ValidationError(f"Sorry, the user account with email {email} has been disabled. Please contact the admin to resolve it!")

        # generate access and refresh tokens
        token = self.generate_token(user)
        user_data = UserAccountSerializer(user).data
        user_data["refresh_data"] = str(token)
        user_data["access_data"] = str(token.access_token)
        
        return user_data


class UpdateAccountSerializer(serializers.ModelSerializer):

    class Meta:
        fields = ["firstname", "lastname", "profile_picture"]
        model = UserAccount
    
    def validate_firstname(self, value: str) -> str:
        if re.match(NAME_REGEX, value):
            return value
        
        return serializers.ValidationError("Invalid first name format!")
    
    def validate_lastname(self, value: str) -> str:
        if re.match(NAME_REGEX, value):
            return value
        
        return serializers.ValidationError("Invalid last name format!")
    
    def validate(self, attrs: dict) -> dict:
        if "profile_picture" in attrs:
            if not attrs["profile_picture"].name.endswith((".jpg", ".jpeg", ".png")):
                raise serializers.ValidationError("Profile picture must be an image!")
            
            if UserAccount.objects.filter(profile_picture=attrs["profile_picture"]).exists():
                raise serializers.ValidationError("Profile picture already exists!")
        
        return attrs
    
    def update(self, instance: UserAccount, validated_data: dict) -> UserAccount:
        user = self.context["request"].user

        # ensure authenticated user is the account owner
        if user != instance:
            raise serializers.ValidationError("You do not have permission to update this user account!")
        
        instance.firstname = validated_data.get("firstname", instance.firstname)
        instance.lastname = validated_data.get("lastname", instance.lastname)
        instance.profile_picture = validated_data.get("profile_picture", instance.profile_picture)
        instance.save()
        return instance


class ChangePasswordSerializer(serializers.Serializer):

    current_password = serializers.CharField(required=True, write_only=True)
    new_password = serializers.CharField(required=True, write_only=True)
    confirm_password = serializers.CharField(required=True, write_only=True)

    def validate_current_password(self, value: str) -> str:
        
        if not re.match(PASSWORD_REGEX, value):
            raise serializers.ValidationError("Invalid password format!")
        
        user = self.context["request"].user
        if not user.check_password(value):
            raise serializers.ValidationError("Current password is incorrect!")
        
        return value
    
    def validate_new_password(self, value: str) -> str:
        if re.match(PASSWORD_REGEX, value):
            return value
        
        raise serializers.ValidationError("Invalid password format!")
    
    def validate_confirm_password(self, value: str) -> str:
        if re.match(PASSWORD_REGEX, value):
            return value
        
        raise serializers.ValidationError("Invalid password format!")
    
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
    

class UniversitySerializer(serializers.ModelSerializer):

    class Meta:
        model = University
        fields = ["id", "name", "location"]

    def validate(self, attrs: dict) -> dict:
        if "name" in attrs and not re.match(NAME_REGEX, attrs["name"]):
            raise serializers.ValidationError("Invalid university name format!")
        
        if not "location" in attrs:
            attrs["location"] = ""
        
        if "name" in attrs and "location" in attrs:
            if University.objects.filter(name=attrs["name"], location=attrs["location"]).exists():
                raise serializers.ValidationError("University already exists!")
        
        return attrs
    
    def update(self, instance: University, validated_data: dict) -> University:
        instance.name = validated_data.get("name", instance.name)
        instance.location = validated_data.get("location", instance.location)
        instance.save()
        return instance


class UserUniversitySerializer(serializers.ModelSerializer):

    class Meta:
        model = UserUniversity
        fields = ["id", "user", "university"]
    
    def validate(self, attrs: dict) -> dict:
        if UserUniversity.objects.filter(user=attrs["user"], university=attrs["university"]).exists():
            raise serializers.ValidationError("User is already associated with the university!")
        
        return attrs
    
    def to_representation(self, instance: UserUniversity) -> dict:
        data = super().to_representation(instance)
        data["user"] = instance.user.id
        data["university"] = UniversitySerializer(instance.university).data
        return data
    

class UserRoutineSerializer(serializers.ModelSerializer):
    user = serializers.SerializerMethodField("get_user")

    class Meta:
        model = UserRoutine
        fields = ["id", "user", "name", "type", "start_time", "end_time"]

    def get_user(self, obj: UserRoutine) -> dict:
        return self.context["request"].user.id

    def validate_name(self, value: str) -> str:
        if re.match(NAME_REGEX, value):
            return value
        
        raise serializers.ValidationError("Invalid routine name format!")
    
    def validate(self, attrs: dict) -> dict:
        attrs["user"] = self.context["request"].user

        if "name" in attrs and UserRoutine.objects.filter(user=attrs["user"], name=attrs["name"]).exists():
            raise serializers.ValidationError("Routine already exists!")
        
        if "start_time" in attrs and "end_time" in attrs:
            if attrs["start_time"] > attrs["end_time"]:
                raise serializers.ValidationError("Start time must be less than end time!")
        
        return attrs
    

class UserDetailsSerializer(serializers.ModelSerializer):

    class Meta:
        model = UserAccount
        fields = ["id", "firstname", "lastname", "email", "profile_picture", "date_joined"]

    def to_representation(self, instance: UserAccount) -> dict:
        """
            method to serialize the user account data
        """

        user_data = super().to_representation(instance)
        
        # retrieve user's universities
        universities = UserUniversity.objects.filter(user=instance)
        user_data["universities"] = []
        for university in universities:
            data = UserUniversitySerializer(university).data
            user_data["universities"].append(data)

        # retrieve user's routines
        user_data["routines"] = []
        routines = UserRoutine.objects.filter(user=instance)
        for routine in routines:
            data = UserRoutineSerializer(routine, context={"request": self.context["request"]}).data
            user_data["routines"].append(data)
        
        return user_data