from django.urls import path
from . import views

urlpatterns = [
    path('search-trains/', views.search_trains, name='search_trains'),
] 