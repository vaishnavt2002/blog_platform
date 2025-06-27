from dataclasses import field
from rest_framework import serializers
from .models import CustomUser
from django.contrib.auth import authenticate



class UserRegisterSerializer(serializers.ModelSerializer):

    class Meta:
        model = CustomUser
        fields = ['email', 'username']

    def validate_username(self, value):
        if len(value) < 6:
            raise serializers.ValidationError("Length of the user name must be greater than 5")
        if not value[0].isalnum():
            raise serializers.ValidationError("First character must be number or character")
        return value
    def create(self, validated_data):
        if not validated_data.get('username'):
            validated_data['username'] = validated_data['email']
        user = CustomUser.objects.create_user(email = validated_data['email'], username=validated_data['username'], password=None)
        return user

class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['username', 'email']

class OtpVerifySerializer(serializers.Serializer):
    email = serializers.EmailField()
    code = serializers.CharField(max_length = 6, min_length = 6)
    password = serializers.CharField(write_only = True, min_length = 8)
    def validate_password(self, value):
        if not any(char.isupper() for char in value):
            raise serializers.ValidationError("There should be atleast one capital letter in password")
        if not any(char.isdigit() for char in value):
            raise serializers.ValidationError("Password must contain atleast one number")
        return value
