from rest_framework import status, generics
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated

from .models import UserAccount, AccessTokenBlacklist
from .serializers import (AccountRegistrationSerializer, AccountLoginSerializer, UserAccountSerializer,
                          ChangePasswordSerializer)
from .permissions import IsAccessTokenBlacklisted


class AccountRegistrationView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = AccountRegistrationSerializer(data=request.data)

        if serializer.is_valid():
            account = serializer.save()
            return Response(UserAccountSerializer(account).data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)