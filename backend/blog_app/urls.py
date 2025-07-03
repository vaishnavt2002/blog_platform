from django.urls import path,include
from auth_app.views import *
from rest_framework.routers import DefaultRouter
from .views import PostViewSet, CommentViewSet, UserViewSet

router = DefaultRouter()
router.register(r'posts', PostViewSet, basename='posts')
router.register(r'comments', CommentViewSet, basename='comments')
router.register(r'users', UserViewSet, basename='users')

urlpatterns = [
    path('',include(router.urls))
]