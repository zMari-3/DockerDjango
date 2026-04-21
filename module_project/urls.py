from django.urls import path
from . import views  

app_name = 'module_project'

urlpatterns = [
    path('', views.home, name='home'),
    path('search/', views.search, name='search'),
    path('films/', views.film_list, name='film_list'),
    path('films/<int:pk>/', views.film_detail, name='film_detail'),
    path('films/create/', views.film_create, name='film_create'),
    path('films/<int:pk>/update/', views.film_update, name='film_update'),
    path('films/<int:pk>/delete/', views.film_delete, name='film_delete'),
    path('producers/', views.producer_list, name='producer_list'),
    path('producers/create/', views.producer_create, name='producer_create'),
    path('get-favorites/', views.get_favorites, name='get_favorites'),
    path('get-films-for-wheel/', views.get_films_for_wheel, name='get_films_for_wheel'),
]