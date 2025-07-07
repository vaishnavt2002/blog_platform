from rest_framework import serializers
from .models import Post, Comment
from django.contrib.auth import get_user_model
import os
import re

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email', 'username']

class PostSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)
    likes_count = serializers.SerializerMethodField()
    is_liked = serializers.SerializerMethodField()
    
    image_url = serializers.SerializerMethodField()
    file_url = serializers.SerializerMethodField()
    
    image = serializers.ImageField(write_only=True, required=False, allow_null=True)
    file = serializers.FileField(write_only=True, required=False, allow_null=True)
    
    class Meta:
        model = Post
        fields = [
            'id', 'title', 'content', 'author', 'image', 'file', 
            'image_url', 'file_url', 'read_count', 'likes_count', 
            'is_liked', 'created_at', 'updated_at'
        ]
    
    def validate_title(self, value):
        if not value:
            raise serializers.ValidationError("Title cannot be empty")
        if len(value) < 5:
            raise serializers.ValidationError("Title must be at least 5 characters long")
        if not re.match(r'^[a-zA-Z0-9]', value):
            raise serializers.ValidationError("Title must start with a letter or number")
        return value
    
    def validate_content(self, value):
        if not value:
            raise serializers.ValidationError("Content cannot be empty")
        if len(value) < 5:
            raise serializers.ValidationError("Content must be at least 5 characters long")
        if not re.match(r'^[a-zA-Z0-9]', value):
            raise serializers.ValidationError("Content must start with a letter or number")
        return value
    
    def validate_image(self, value):
        if value:
            valid_extensions = ['.jpg', '.jpeg', '.png', '.gif']
            ext = os.path.splitext(value.name)[1].lower()
            if ext not in valid_extensions:
                raise serializers.ValidationError(
                    "Invalid image format. Only JPG, JPEG, PNG, and GIF are allowed."
                )
            max_size = 5 * 1024 * 1024  # 5MB
            if value.size > max_size:
                raise serializers.ValidationError(
                    "Image file size must be less than 5MB"
                )
        return value
    
    def validate_file(self, value):
        if value:
            ext = os.path.splitext(value.name)[1].lower()
            if ext != '.pdf':
                raise serializers.ValidationError(
                    "File must be in PDF format"
                )
            max_size = 10 * 1024 * 1024  # 10MB
            if value.size > max_size:
                raise serializers.ValidationError(
                    "PDF file size must be less than 10MB"
                )
        return value
    
    def get_likes_count(self, obj):
        return obj.likes.count()
    
    def get_is_liked(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.likes.filter(id=request.user.id).exists()
        return False
    
    def get_image_url(self, obj):
        if obj.image:
            return obj.image.url
        return None
    
    def get_file_url(self, obj):
        if obj.file:
            return obj.file.url
        return None
    
    def create(self, validated_data):
        image = validated_data.pop('image', None)
        file = validated_data.pop('file', None)
        
        post = Post.objects.create(**validated_data)
        
        if image:
            post.image = image
        if file:
            post.file = file
        
        post.save()
        return post
    
    def update(self, instance, validated_data):
        image = validated_data.pop('image', None)
        file = validated_data.pop('file', None)
        
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        if image:
            instance.image = image
        if file:
            instance.file = file
        
        instance.save()
        return instance

class CommentSerializer(serializers.ModelSerializer):
    post = serializers.PrimaryKeyRelatedField(queryset=Post.objects.all())
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = Comment
        fields = ['id', 'post', 'user', 'content', 'is_approved', 'created_at']
    
    def validate_content(self, value):
        if not value:
            raise serializers.ValidationError("Comment content cannot be empty")
        if not re.match(r'^[a-zA-Z0-9]', value):
            raise serializers.ValidationError(
                "Comment must start with a letter or number"
            )
        return value