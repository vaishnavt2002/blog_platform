from urllib import request
from rest_framework import viewsets, permissions, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from .models import Post, Comment
from .serializers import *
from django.contrib.auth import get_user_model
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly, IsAdminUser
from rest_framework.pagination import PageNumberPagination
from django.db.models import Q
from django.shortcuts import get_object_or_404
from rest_framework.exceptions import PermissionDenied

User = get_user_model()

class PostPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100

class PostViewSet(viewsets.ModelViewSet):
    queryset = Post.objects.all()
    serializer_class = PostSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    parser_classes = [MultiPartParser, FormParser] 
    pagination_class = PostPagination
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'content', 'author__email']
    ordering_fields = ['created_at', 'read_count', 'likes_count']
    ordering = ['-created_at']

    def perform_create(self, serializer):
        return serializer.save(author=self.request.user)
    
    def get_queryset(self):
        queryset = Post.objects.all()
        if self.action == 'list':
            if self.request.user.is_authenticated:
                queryset = queryset.filter(~Q(author=self.request.user))
        
        return queryset
    
    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def my_posts(self, request):
        posts = Post.objects.filter(author=request.user).order_by('-created_at')
        page = self.paginate_queryset(posts)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(posts, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def like(self, request, pk):
        post = self.get_object()
        user = request.user
        if user in post.likes.all():
            post.likes.remove(user)
            return Response({'message': 'Post Unliked'}, status=status.HTTP_200_OK)
        else:
            post.likes.add(user)
            return Response({'message': 'Post Liked'}, status=status.HTTP_200_OK)
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def increment_read_count(self, request, pk):
        post = self.get_object()
        post.read_count += 1
        post.save()
        return Response({'message': 'Post read count incremented'}, status=status.HTTP_200_OK)

class CommentViewSet(viewsets.ModelViewSet):
    queryset = Comment.objects.all()
    serializer_class = CommentSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        queryset = Comment.objects.all()
        post_id = self.request.query_params.get('post')
        if post_id is not None:
            if self.request.user.is_authenticated:
                queryset = queryset.filter(
                    Q(post__id=post_id) & (Q(is_approved=True) | Q(user=self.request.user))
                ).order_by('-created_at')
            else:
                queryset = queryset.filter(post__id=post_id, is_approved=True).order_by('-created_at')
        return queryset
    
    def perform_create(self, serializer):
        post_id = self.request.data.get('post')
        post = Post.objects.get(id=post_id)
        if post.author == self.request.user:
            raise serializers.ValidationError("You cannot comment on your own post")
        serializer.save(user=self.request.user, is_approved=False)
    
    def perform_update(self, serializer):
        # Added permission check to ensure only the comment's author can edit
        comment = self.get_object()
        if self.request.user != comment.user:
            raise PermissionDenied("You are not allowed to edit this comment.")
        # Reset is_approved to False on update to require re-approval
        serializer.save(is_approved=False)
    
    def destroy(self, request, *args, **kwargs):
        comment = self.get_object()
        if request.user != comment.user:
            raise PermissionDenied("You are not allowed to delete this comment.")
        return super().destroy(request, *args, **kwargs)

class AdminCommentViewSet(viewsets.ModelViewSet):
    queryset = Comment.objects.filter(is_approved=False)
    serializer_class = CommentSerializer
    permission_classes = [IsAdminUser]

    def destroy(self, request, *args, **kwargs):
        comment = self.get_object()
        return super().destroy(request, *args, **kwargs)

    @action(detail=True, methods=['post'], permission_classes=[IsAdminUser])
    def approve(self, request, pk):
        comment = self.get_object()
        comment.is_approved = True
        comment.save()
        return Response({"message": "Comment approved"}, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'], permission_classes=[IsAdminUser])
    def block(self, request, pk):
        comment = self.get_object()
        comment.is_approved = False
        comment.save()
        return Response({"message": "Comment blocked"}, status=status.HTTP_200_OK)

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAdminUser]