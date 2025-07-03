from rest_framework import serializers
from .models import Post, Comment
from django.contrib.auth import get_user_model

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email', 'username']

class PostSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)
    likes_count = serializers.SerializerMethodField()
    is_liked = serializers.SerializerMethodField()
    
    # For reading - return URLs
    image_url = serializers.SerializerMethodField()
    file_url = serializers.SerializerMethodField()
    
    # For writing - accept file uploads
    image = serializers.ImageField(write_only=True, required=False, allow_null=True)
    file = serializers.FileField(write_only=True, required=False, allow_null=True)
    
    class Meta:
        model = Post
        fields = [
            'id', 'title', 'content', 'author', 'image', 'file', 
            'image_url', 'file_url', 'read_count', 'likes_count', 
            'is_liked', 'created_at', 'updated_at'
        ]
    
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
