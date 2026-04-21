
from django.db import models
from django.urls import reverse
from django.contrib.auth.models import User # Добавим для избранного

class Producer(models.Model):
    name = models.CharField(
        max_length=100, 
        verbose_name="Имя режиссёра"  
    )
    birth_year = models.IntegerField(
        verbose_name="Год рождения",
        null=True,  
        blank=True  
    )
    country = models.CharField(
        max_length=50, 
        verbose_name="Страна", 
        blank=True  
    )

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = "Режиссёр"
        verbose_name_plural = "Режиссёры"

class Film(models.Model):
    title = models.CharField(
        max_length=200, 
        verbose_name="Название фильма"
    )
    producer = models.ForeignKey(
        Producer, 
        on_delete=models.CASCADE, 
        related_name='films', 
        verbose_name="Режиссёр"
    )
    publication_year = models.IntegerField(
        verbose_name="Год выхода"
    )
    cover_image = models.ImageField(
        upload_to='film_covers/',
        verbose_name="Постер фильма", 
        blank=True, 
        null=True  
    )
    rating = models.FloatField(
        verbose_name="Рейтинг"
    )
    age_limit = models.IntegerField(
        verbose_name="Возрастное ограничение", 
        blank=True,
        null=True # Лучше разрешить null
    )
    description = models.TextField(
        verbose_name="Описание", 
        blank=True 
    )
    # Добавим дату создания для сортировки
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name="Дата добавления"
    )

    trailer_file = models.FileField(
        verbose_name="Файл трейлера",
        upload_to='film_trailers/',
        blank=True,
        null=True,
        help_text="Загрузите видеофайл трейлера (MP4, WebM)"
    )

    def __str__(self):
        return f"{self.title} - {self.producer.name}"
    
    def get_absolute_url(self):
        return reverse('module_project:film_detail', args=[str(self.id)])
    
    class Meta:
        verbose_name = "Фильм"
        verbose_name_plural = "Фильмы"
        ordering = ['-created_at'] # Сортировка по умолчанию
        
    def get_trailer_url(self):
        """Возвращает URL трейлера"""
        if self.trailer_file:
            return self.trailer_file.url
        return None


class Favorite(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    film = models.ForeignKey(Film, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'film') # Чтобы нельзя было добавить один фильм дважды
        verbose_name = "Избранное"
        verbose_name_plural = "Избранное"





