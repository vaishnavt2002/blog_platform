from rest_framework import serializers
from .models import CustomUser
from django.contrib.auth import authenticate
import re

class UserRegisterSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['username', 'email']
    
    def validate_username(self, value):
        if len(value) < 6:
            raise serializers.ValidationError('Username must be at least 6 characters long.')
        if not any(char.isalpha() for char in value):
            raise serializers.ValidationError('Username must contain at least one letter.')
        return value
    
    def create(self, validated_data):
        user = CustomUser.objects.create_user(
            email=validated_data['email'],
            username=validated_data['username'],
            password=None
        )
        return user

class UserProfileSerializer(serializers.ModelSerializer):
    is_verified = serializers.BooleanField(default=False)
    class Meta:
        model = CustomUser
        fields = ['email', 'username', 'is_verified','is_staff']

class OtpVerifySerializer(serializers.Serializer):
    email = serializers.EmailField()
    code = serializers.CharField(max_length=6)
    password = serializers.CharField(
        write_only=True,
        min_length=8,
    )

    def validate_password(self, value):
        if not any(char.isupper() for char in value):
            raise serializers.ValidationError('Password must contain at least one uppercase letter.')
        if not any(char.isdigit() for char in value):
            raise serializers.ValidationError('Password must contain at least one number.')
        return value

class OTPRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()

class ForgotPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField()

class ForgotPasswordResetSerializer(serializers.Serializer):
    email = serializers.EmailField()
    code = serializers.CharField(max_length=6)
    password = serializers.CharField(
        write_only=True,
        min_length=8,
    )

    def validate_password(self, value):
        if not any(char.isupper() for char in value):
            raise serializers.ValidationError('Password must contain at least one uppercase letter.')
        if not any(char.isdigit() for char in value):
            raise serializers.ValidationError('Password must contain at least one number.')
        return value

class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        user = authenticate(email=data['email'], password=data['password'])
        if user and user.is_verified:
            return user
        if not user:
            raise serializers.ValidationError('Invalid email or password.')
        if not user.is_verified:
            raise serializers.ValidationError('Email not verified. Register again')
        return user