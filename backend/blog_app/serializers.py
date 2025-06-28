from rest_framework import serializers
from .models import Post, Comment
from django.contrib.auth import get_user_model

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email', 'username']

class PostSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only= True)
    likes_count = serializers.SerializerMethodField()
    image = serializers.CharField(source='image.url', read_only = True, allow_null= True)
    file = serializers.CharField(source='file.url', read_only=True, allow_null= True)
    class Meta:
        model = Post
        fields = ['id', 'title', 'content', 'author', 'image', 'file', 'read_count', 'likes_count', 'created_at', 'updated_at']

    def get_likes_count(self, obj):
        return obj.likes.count()
    
class CommentSerializer(serializers.ModelSerializer):
    post = serializers.PrimaryKeyRelatedField(queryset = Post.objects.all())
    user = UserSerializer(read_only = True)

    class Meta:
        model = Comment
        fields = ['id','post', 'user', 'content', 'is_approved', 'created_at']
