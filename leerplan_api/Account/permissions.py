from rest_framework.permissions import BasePermission
from rest_framework.exceptions import AuthenticationFailed
from .models import AccessTokenBlacklist


class IsAccessTokenBlacklisted(BasePermission):
    """
        custom permission class to check if the access token is blacklisted

        Args:
            BasePermission ([class]): [BasePermission class from rest_framework.permissions]

        Returns:
            [boolean]: [True if the access token is not blacklisted, False otherwise]
    """

    def has_permission(self, request, view):
        
        access_token = request.META.get('HTTP_AUTHORIZATION').split(' ')[1]

        # if the token is blacklisted, raise an exception
        if AccessTokenBlacklist.objects.filter(token=access_token).exists():
            raise AuthenticationFailed("User is not authenticated!")
        
        return True