from django.contrib import admin

from auth_app.models import CustomUser

# Register your models here.
admin.site.register([CustomUser])