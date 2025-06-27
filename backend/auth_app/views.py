from multiprocessing.reduction import send_handle
from random import random
from socket import timeout
from django.shortcuts import render
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
import logging
from rest_framework import status
from .serializers import *
from auth_app.models import CustomUser
import random
from django.core.cache import cache
from django.core.mail import send_mail
from django.conf import settings


logger = logging.getLogger(__name__)

def send_otp_email(email, otp):
        send_mail(
            subject='Your OTP for Our Application',
            message=f'Your OTP for registration is {otp}',
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[email],
            fail_silently=False,
        )


class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email')

        try:
            existing_user = CustomUser.objects.get(email=email)
            if existing_user.is_verified:
                return Response({
                    'message':'User with this email already exist and verified',
                }, status=status.HTTP_400_BAD_REQUEST)
            else:
                logger.info(f"Updating existing verified user: {email}")
                serializer = UserRegisterSerializer(existing_user, data= request.data, partial = True)
                if serializer.is_valid():
                    user = serializer.save()
                    otp = str(random.randint(100000,999999))
                    cache.set(f'otp_{user.email}_register',otp,timeout=10*60)
                    #sending email
                    try:
                        send_otp_email(user.email, otp)
                        logger.info(f"User updated and email sent successfully for user {user.email}")
                        return Response(
                            {'user':serializer.data,'message':'User profile updated and otp sent'},
                            status= status.HTTP_200_OK
                        )
                    except Exception as e:
                        logger.error(f"Failed to send email for user {user.email}:{str(e)} ")
                        return Response({
                            'message':'Failed to send the otp'
                        },status=status.HTTP_400_BAD_REQUEST)
                else:
                    logger.error(f"Serializer validation failed for user {existing_user.email},{serializer.errors}")
                    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except CustomUser.DoesNotExist:
            serializer = UserRegisterSerializer(data = request.data)
            if serializer.is_valid():
                user = serializer.save()
                otp = str(random.randint(100000,999999))
                cache.set(f'otp_{user.email}_register',otp,timeout=10*60)
                try:
                    send_otp_email(user.email, otp)
                    logger.info(f"User added and email sent successfully for user {user.email}")
                    return Response(
                        {'user':serializer.data,'message':'User profile updated and otp sent'},
                        status= status.HTTP_201_CREATED
                    )
                except Exception as e:
                    logger.error(f"Failed to send email for user {user.email}:{str(e)} ")
                    return Response({
                        'message':'Failed to send the otp'
                    },status=status.HTTP_400_BAD_REQUEST)
            else:
                logger.error(f'Serializer validation failed for user {user.email},{serializer.errors}')
                return Response(serializer.errors, status= status.HTTP_400_BAD_REQUEST)


class OtpVerifyView(APIView):
    permission_classes=[AllowAny]

    def post(self, request):
        serializer = OtpVerifySerializer(data= request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            code = serializer.validated_data['code']
            password = serializer.validated_data['password']
            try:
                user = CustomUser.objects.get(email= email)
                cached_otp = cache.get(f'otp_{email}_register')
                if cached_otp and cached_otp == code:
                    cache.delete(f'otp_{email}_register')
                    user.is_verified = True
                    user.set_password(password)
                    user.save()
                    logger.info(f"User {email} verified successfully")
                    return Response({'user':UserProfileSerializer(user).data, 'message':'User verified successfully'}, status= status.HTTP_200_OK)
                logger.warning(f"Otp is not matching or expired of the user {email}")
                return Response({"message":"Otp verification failed due to invalid or expired otp"}, status= status.HTTP_400_BAD_REQUEST)
            except CustomUser.DoesNotExist:
                logger.error(f"The user {email} nof found")
                return Response({'message':f'User {email} not found'}, status=status.HTTP_400_BAD_REQUEST)
        logger.error(f"Serializer error: {serializer.errors}")
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    




