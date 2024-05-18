from rest_framework import status, generics
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken, AccessToken, TokenError
from django.utils import timezone
import os

from .models import UserAccount, AccessTokenBlacklist, University, UserUniversity, UserRoutine
from .serializers import (
    AccountRegistrationSerializer, AccountLoginSerializer, UserAccountSerializer,
    UpdateAccountSerializer, ChangePasswordSerializer, UniversitySerializer,
    UserUniversitySerializer, UserRoutineSerializer)
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
        serializer = UserAccountSerializer(request.user, context={"request": request})
        return Response(serializer.data, status=status.HTTP_200_OK)

    
class UpdateAccountView(APIView):
    permission_classes = [IsAuthenticated, IsAccessTokenBlacklisted]

    def patch(self, request):
        serializer = UpdateAccountSerializer(request.user, data=request.data, partial=True, context={"request": request})

        if serializer.is_valid():
            account = serializer.save()

            # if the profile picture is updated, remove the previous profile picture
            if "profile_picture" in request.data and request.user.profile_picture:
                if os.path.exists(request.user.profile_picture.path):
                    os.remove(request.user.profile_picture.path)

            account = UserAccountSerializer(account)
            return Response(account.data, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ChangePasswordView(generics.UpdateAPIView):
    permission_classes = [IsAuthenticated, IsAccessTokenBlacklisted]
    queryset = UserAccount.objects.all()

    def update(self, request, **kwargs):

        partial = kwargs.pop("partial", False)
        serializer = ChangePasswordSerializer(request.user, data=request.data, partial=partial, context={"request": request})
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response({"message": "Password changed successfully!"}, status=status.HTTP_200_OK)
    

class AccountLogoutView(APIView):
    permission_classes = [IsAuthenticated, IsAccessTokenBlacklisted]

    def post(self, request):

        refresh_token = request.COOKIES.get("refresh_token")
        access_token = request.COOKIES.get("access_token")

        try:
            refresh = RefreshToken(refresh_token)
            refresh.blacklist()
        except TokenError:
            return Response({"message": "Invalid JWT token!"})
        
        try:
            access = AccessToken(access_token)

            if not AccessTokenBlacklist.objects.filter(token=access_token).exists():
                AccessTokenBlacklist.objects.create(token=access)
            
        except TokenError:
            return Response({"message": "Invalid JWT token!"})
        
        response = Response({"message": "User logged out!"}, status=status.HTTP_200_OK)
        response.delete_cookie("refresh_token")
        response.delete_cookie("access_token")
        return response


class RetrieveUniversitiesView(generics.ListAPIView):
    permission_classes = [IsAuthenticated, IsAccessTokenBlacklisted]
    queryset = University.objects.all()
    serializer_class = UniversitySerializer


class UpdateUniversityView(generics.UpdateAPIView):
    permission_classes = [IsAuthenticated, IsAccessTokenBlacklisted]
    queryset = University.objects.all()
    serializer_class = UniversitySerializer
    lookup_field = "id"


class AddUserUniversityView(APIView):
    permission_classes = [IsAuthenticated, IsAccessTokenBlacklisted]

    def post(self, request):
        # check if the university exists
        try:
            university = University.objects.get(name=request.data["university"])
        except University.DoesNotExist:
            # create a new university if it does not exist
            university_serializer = UniversitySerializer(data=request.data)
            if university_serializer.is_valid():
                university = university_serializer.save()

            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        # create request body with user and university id
        request.data["user"] = request.user
        request.data["university"] = university
        serializer = UserUniversitySerializer(data=request.data)

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    

class RemoveUserUniversityView(APIView):
    permission_classes = [IsAuthenticated, IsAccessTokenBlacklisted]

    # update implementation to only allow deleting when the user hasn't
    # added any course for this particular university

    # def delete(self, request, id):
    #     try:
    #         user_university = UserUniversity.objects.get(id=id)
    #     except UserUniversity.DoesNotExist:
    #         return Response({"error": f"No user university exist with the id {id}!"}, status=status.HTTP_404_NOT_FOUND)

    #     if user_university.user != request.user:
    #         return Response({"error": "You are not allowed to perform this action!"}, status=status.HTTP_403_FORBIDDEN)
        
    #     user_university.delete()
    #     return Response({"message": "User university removed successfully!"}, status=status.HTTP_200_OK)


class RetrieveUserUniversitiesView(generics.ListAPIView):
    permission_classes = [IsAuthenticated, IsAccessTokenBlacklisted]
    queryset = UserUniversity.objects.all()
    serializer_class = UserUniversitySerializer
    lookup_field = "user"
    lookup_url_kwarg = "user_id"

    # filter the queryset based on the user id
    def get_queryset(self):
        return UserUniversity.objects.filter(user=self.kwargs["user_id"])
    

class AddUserRoutineView(APIView):
    permission_classes = [IsAuthenticated, IsAccessTokenBlacklisted]

    def post(self, request):
        serializer = UserRoutineSerializer(data=request.data, context={"request": request})

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    

class UpdateUserRoutineView(APIView):
    permission_classes = [IsAuthenticated, IsAccessTokenBlacklisted]

    def patch(self, request, routine_id):
        try:
            user_routine = UserRoutine.objects.get(id=routine_id)
        except UserRoutine.DoesNotExist:
            return Response({"error": f"No user routine exist with the id {routine_id}!"}, status=status.HTTP_404_NOT_FOUND)
        
        if user_routine.user != request.user:
            return Response({"error": "You are not allowed to perform this action!"}, status=status.HTTP_403_FORBIDDEN)

        serializer = UserRoutineSerializer(user_routine, data=request.data, partial=True, context={"request": request})

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class RetrieveUserRoutineView(APIView):
    permission_classes = [IsAuthenticated, IsAccessTokenBlacklisted]

    def get(self, request, routine_id):
        try:
            user_routine = UserRoutine.objects.get(id=routine_id)
        except UserRoutine.DoesNotExist:
            return Response({"error": f"No user routine exist with the id {routine_id}!"}, status=status.HTTP_404_NOT_FOUND)
        
        if user_routine.user != request.user:
            return Response({"error": "You are not allowed to perform this action!"}, status=status.HTTP_403_FORBIDDEN)
        
        serializer = UserRoutineSerializer(user_routine)
        return Response(serializer.data, status=status.HTTP_200_OK)

class RetrieveUserRoutinesView(APIView):
    permission_classes = [IsAuthenticated, IsAccessTokenBlacklisted]

    def get(self, request):
        user_routines = UserRoutine.objects.filter(user=request.user)
        serializer = UserRoutineSerializer(user_routines, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    

class DeleteUserRoutineView(APIView):
    permission_classes = [IsAuthenticated, IsAccessTokenBlacklisted]

    def delete(self, request, routine_id):
        try:
            user_routine = UserRoutine.objects.get(id=routine_id)
        except UserRoutine.DoesNotExist:
            return Response({"error": f"No user routine exist with the id {routine_id}!"}, status=status.HTTP_404_NOT_FOUND)
        
        if user_routine.user != request.user:
            return Response({"error": "You are not allowed to perform this action!"}, status=status.HTTP_403_FORBIDDEN)
        
        user_routine.delete()
        return Response({"message": "User routine removed successfully!"}, status=status.HTTP_200_OK)