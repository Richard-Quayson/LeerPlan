from rest_framework import status, generics
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.views import TokenObtainPairView
from datetime import timezone

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
    

class AccountLoginView(TokenObtainPairView):
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        serializer = AccountLoginSerializer(data=request.data)

        if response.status_code == status.HTTP_200_OK:
            if serializer.is_valid():
                try:
                    user_account = UserAccount.objects.get(email=request.data["email"])
                except UserAccount.DoesNotExist:
                    return Response({"error": f"No user account exist with the email {request.data["email"]}!"})
                
                if not user_account.is_active:
                    return Response({"error": "Sorry this account has been disabled. Please contact admin to resolve it!"})
                
                # set refresh and access cookies
                response.set_cookie(key="refresh_token", value=response.data["refresh"],
                                    httponly=True, samesite="None", secure=True)
                response.set_cookie(key="access_token", value=response.data["access"],
                                    httponly=True, samesite="None", secure=True)
                
                # update user account's last login
                user_account.last_login = timezone.now()
                user_account.save()

                return response

            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        return Response({"error": "Failed to generate refresh and access tokens!"}, status=status.HTTP_424_FAILED_DEPENDENCY)
    

class AccountView(APIView):
    permission_classes = [IsAuthenticated, IsAccessTokenBlacklisted]

    def get(self, request):
        serializer = UserAccountSerializer(request.user, context={"request", request})
        return Response(serializer.data, status=status.HTTP_200_OK)

    
class ChangePasswordView(generics.UpdateAPIView):
    permission_classes = [IsAuthenticated, IsAccessTokenBlacklisted]
    queryset = UserAccount.objects.all()

    def update(self, request, **kwargs):

        partial = kwargs.pop("partial", False)
        serializer = ChangePasswordSerializer(request.user, data=request.data, partial=partial, context={"request": request})
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response({"message": "Password changed successfully!"}, status=status.HTTP_200_OK)