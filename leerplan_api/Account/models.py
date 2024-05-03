from django.db import models
from django.contrib.auth.models import AbstractUser, BaseUserManager, PermissionsMixin
from django.utils import timezone
from datetime import timedelta


class CustomUserAccountManager(BaseUserManager):
    """
        custom user manager class to handle the creation of users

        Args:
            BaseUserManager ([class]): [BaseUserManager class from django.contrib.auth.models]

        Returns:
            [class]: [CustomUserAccountManager class]
    """

    def create_user(self, email:str, password:str, **other_fields:dict) -> object:
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

    def create_superuser(self, email:str, password:str, **other_fields:dict) -> object:
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


class UserAccount(AbstractUser, PermissionsMixin):
    """
        custom user model class to handle user accounts

        Args:
            AbstractUser ([class]): [AbstractUser class from django.contrib.auth.models]
            PermissionsMixin ([class]): [PermissionsMixin class from django.contrib.auth.models]

        Returns:
            [class]: [UserAccount class]

        Attributes:
            - firstname ([CharField]): [first name of the user]
            - lastname ([CharField]): [last name of the user]
            - email ([EmailField]): [email of the user]
            - major ([CharField]): [major of the user]
            - date_joined ([DateTimeField]): [date the user joined]
    """
    
    # define the fields of the user model
    firstname = models.CharField(max_length=50)
    lastname = models.CharField(max_length=50)
    email = models.EmailField(unique=True)
    major = models.CharField(max_length=100)
    date_joined = models.DateTimeField(default=timezone.now)

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

        cls.objects.filter(blacklisted_on__lt=timezone.now() - timedelta(days=1)).delete()
    
    class Meta:
        ordering = ['-blacklisted_on']