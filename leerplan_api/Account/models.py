from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.utils import timezone
from datetime import timedelta
from .helper import profile_picture_upload_path


class CustomUserAccountManager(BaseUserManager):
    """
        custom user manager class to handle the creation of users

        Args:
            BaseUserManager ([class]): [BaseUserManager class from django.contrib.auth.models]

        Returns:
            [class]: [CustomUserAccountManager class]
    """

    def create_user(self, email: str, password: str, **other_fields: dict) -> object:
        """
            method to create a regular user account

            Args:
                email ([string]): [email of the user]
                password ([string]): [password of the user]

            Returns:
                [object]: [user object]        
        """

        if not email:
            raise ValueError("Email is required!")

        # set the default values for the other fields
        other_fields.setdefault('is_active', True)
        other_fields.setdefault('is_staff', False)
        other_fields.setdefault('is_superuser', False)

        # create the user
        email = self.normalize_email(email)
        user = self.model(email=email, **other_fields)
        user.set_password(password)
        user.save()

        return user

    def create_superuser(self, email: str, password: str, **other_fields: dict) -> object:
        """
            method to create a super user account

            Args:
                email ([string]): [email of the user]
                password ([string]): [password of the user]

            Returns:
                [object]: [user object]        
        """

        # set the default values for the other fields
        other_fields.setdefault('is_active', True)
        other_fields.setdefault('is_staff', True)
        other_fields.setdefault('is_superuser', True)

        # ensure the user is a superuser and staff
        if other_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')

        if other_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')

        # create the user
        return self.create_user(email, password, **other_fields)


class UserAccount(AbstractBaseUser, PermissionsMixin):
    """
        custom user model class to handle user accounts

        Args:
            AbstractBaseUser ([class]): [AbstractBaseUser class from django.contrib.auth.models]
            PermissionsMixin ([class]): [PermissionsMixin class from django.contrib.auth.models]

        Returns:
            [class]: [UserAccount class]

        Attributes:
            - firstname ([CharField]): [first name of the user]
            - lastname ([CharField]): [last name of the user]
            - email ([EmailField]): [email of the user]
            - profile_picture ([ImageField]): [profile picture of the user]
            - date_joined ([DateTimeField]): [date the user joined]
    """

    # define the fields of the user model
    firstname = models.CharField(max_length=50)
    lastname = models.CharField(max_length=50)
    email = models.EmailField(unique=True)
    profile_picture = models.ImageField(
        upload_to=profile_picture_upload_path, blank=True, null=True)
    date_joined = models.DateTimeField(default=timezone.now)

    is_staff = models.BooleanField(default=False)
    is_superuser = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)

    # define the user manager
    objects = CustomUserAccountManager()

    # define the fields that are required for the user model
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['firstname', 'lastname', 'major']

    def __str__(self):
        return f"{self.firstname} {self.lastname}: {self.email}"


class AccessTokenBlacklist(models.Model):
    """
        model class to handle blacklisted access tokens

        Args:
            models ([class]): [models class from django.db]

        Returns:
            [class]: [AccessTokenBlacklist class]

        Attributes:
            - token ([CharField]): [access token]
            - blacklisted_on ([DateTimeField]): [date the token was blacklisted]
    """

    token = models.CharField(max_length=500)
    blacklisted_on = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return self.token

    @classmethod
    def add(cls, token):
        """
            method to add a token to the blacklist

            Args:
                token ([string]): [access token]
        """

        cls.objects.create(token=token)

    @classmethod
    def cleanup(cls):
        """
            method to remove all the blacklisted tokens that are older than 24 hours
        """

        cls.objects.filter(blacklisted_on__lt=timezone.now() -
                           timedelta(days=1)).delete()

    class Meta:
        ordering = ['-blacklisted_on']


class University(models.Model):
    """
        model class to handle universities

        Args:
            models ([class]): [models class from django

        Returns:
            [class]: [University class]

        Attributes:
            - name ([CharField]): [name of the university]
            - location ([CharField]): [location of the university] 
    """

    name = models.CharField(max_length=100)
    location = models.CharField(max_length=100, null=True, blank=True)

    def __str__(self):
        return f"{self.name} in {self.location}"


class UserUniversity(models.Model):
    """
        model class to handle the relationship between users and universities

        Args:
            models ([class]): [models class from django]

        Returns:
            [class]: [UserUniversity class]

        Attributes:
            - user ([ForeignKey]): [user foreign key]
            - university ([ForeignKey]): [university foreign key]
    """

    user = models.ForeignKey(UserAccount, on_delete=models.CASCADE)
    university = models.ForeignKey(University, on_delete=models.CASCADE)

    def __str__(self):
        return f"{self.user.firstname} {self.user.lastname} is at {self.university.name}"


class UserRoutine(models.Model):
    """
        model class to handle user routines

        Args:
            models ([class]): [models class from django]

        Returns:
            [class]: [UserRoutine class]

        Attributes:
            - user ([ForeignKey]): [user foreign key]
            - name ([CharField]): [name of the routine]
            - start_time ([TimeField]): [start time of the routine]
            - end_time ([TimeField]): [end time of the routine]
            - days ([CharField]): [days the routine occurs]
    """

    user = models.ForeignKey(UserAccount, on_delete=models.CASCADE)
    name = models.CharField(max_length=100)
    start_time = models.TimeField()
    end_time = models.TimeField()
    days = models.CharField(max_length=50)

    def __str__(self):
        return f"{self.user.firstname} {self.user.lastname} has {self.name} routine from {self.start_time} to {self.end_time} on {self.days}"


class UserMetaData(models.Model):
    """
    define the user metadata model

    Attributes:
        - user ([ForeignKey]): [user foreign key]
        - min_study_time ([FloatField]): [minimum study time]
        - max_study_time ([FloatField]): [maximum study time]
        - sleep_time ([TimeField]): [time the user sleeps]
        - wake_time ([TimeField]): [time the user wakes up]
    """

    user = models.OneToOneField(UserAccount, on_delete=models.CASCADE)
    min_study_time = models.FloatField()
    max_study_time = models.FloatField()
    sleep_time = models.TimeField()
    wake_time = models.TimeField()

    def __str__(self):
        return f"{self.user.firstname} {self.user.lastname} wake up at {self.wake_time} and sleep at {self.sleep_time} and studies for {self.min_study_time} to {self.max_study_time} hours"
