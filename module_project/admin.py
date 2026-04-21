# admin.py
from django.contrib import admin
from .models import Film, Producer, Favorite

@admin.register(Producer)
class ProducerAdmin(admin.ModelAdmin):
    list_display = ['name', 'birth_year', 'country']
    search_fields = ['name']
    list_filter = ['country']

@admin.register(Film)
class FilmAdmin(admin.ModelAdmin):
    list_display = ['title', 'producer', 'publication_year', 'rating']
    list_filter = ['rating', 'publication_year', 'producer', 'age_limit']
    search_fields = ['title', 'producer__name', 'description']

@admin.register(Favorite)
class FavoriteAdmin(admin.ModelAdmin):
    list_display = ['user', 'film']