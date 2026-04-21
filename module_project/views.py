from django.shortcuts import render, get_object_or_404, redirect
from django.db.models import Q, Count
from django.contrib import messages
from django.http import JsonResponse
from django.template.loader import render_to_string
from .models import Film, Producer
from .forms import FilmForm, ProducerForm, FilmSearchForm
from django.http import JsonResponse

def home(request):
    """
    Главная страница - отображает все фильмы
    """
    films = Film.objects.select_related('producer').all()[:20]
    
    context = {
        'films': films,
        'total_films': Film.objects.count(),
        'total_producers': Producer.objects.count(),
    }
    return render(request, 'module_project/home.html', context)

def search(request):
    """
    Страница поиска с фильтрами
    """
    films = Film.objects.select_related('producer').all()
    form = FilmSearchForm(request.GET or None)
    
    if form.is_valid():
        query = form.cleaned_data.get('query')
        year = form.cleaned_data.get('year')
        rating_min = form.cleaned_data.get('rating_min')
        age_limit = form.cleaned_data.get('age_limit')

        if query:
            films = films.filter(
                Q(title__icontains=query) | 
                Q(producer__name__icontains=query)
            ).distinct()
        
        if year:
            films = films.filter(publication_year=year)
        if rating_min:
            films = films.filter(rating__gte=rating_min)
        if age_limit:
            films = films.filter(age_limit__lte=age_limit)

    if request.headers.get('x-requested-with') == 'XMLHttpRequest':
        html = render_to_string(
            'module_project/includes/film_grid.html', 
            {'films': films},
            request=request
        )
        return JsonResponse({'html': html, 'count': films.count()})

    context = {
        'films': films,
        'form': form,
    }
    return render(request, 'module_project/search.html', context)

def film_list(request):
    films = Film.objects.select_related('producer').all()
    form = FilmSearchForm(request.GET)
    if form.is_valid():
        query = form.cleaned_data.get('query')
        if query:
            films = films.filter(Q(title__icontains=query) | Q(producer__name__icontains=query))
    
    context = {
        'films': films, 
        'form': form
    }
    return render(request, 'module_project/film_list.html', context)

def film_detail(request, pk):
    film = get_object_or_404(Film.objects.select_related('producer'), pk=pk)
    return render(request, 'module_project/film_detail.html', {'film': film})

def film_create(request):
    if request.method == 'POST':
        form = FilmForm(request.POST, request.FILES)
        if form.is_valid():
            film = form.save()
            messages.success(request, f'Фильм "{film.title}" успешно добавлен!')
            return redirect('module_project:film_detail', pk=film.pk)
    else:
        form = FilmForm()
    return render(request, 'module_project/film_form.html', {
        'form': form, 
        'title': 'Добавить фильм'
    })

def film_update(request, pk):
    film = get_object_or_404(Film, pk=pk)
    if request.method == 'POST':
        form = FilmForm(request.POST, request.FILES, instance=film)
        if form.is_valid():
            film = form.save()
            messages.success(request, f'Фильм "{film.title}" успешно обновлен!')
            return redirect('module_project:film_detail', pk=film.pk)
    else:
        form = FilmForm(instance=film)
    return render(request, 'module_project/film_form.html', {
        'form': form, 
        'title': 'Редактировать фильм'
    })

def film_delete(request, pk):
    film = get_object_or_404(Film, pk=pk)
    if request.method == 'POST':
        title = film.title
        film.delete()
        messages.success(request, f'Фильм "{title}" удален!')
        return redirect('module_project:home')
    return render(request, 'module_project/film_confirm_delete.html', {'film': film})

def producer_list(request):
    producers = Producer.objects.annotate(film_count=Count('films')).all()
    return render(request, 'module_project/producer_list.html', {'producers': producers})

def producer_create(request):
    if request.method == 'POST':
        form = ProducerForm(request.POST)
        if form.is_valid():
            producer = form.save()
            messages.success(request, f'Режиссёр {producer.name} успешно добавлен!')
            return redirect('module_project:producer_list')
    else:
        form = ProducerForm()
    return render(request, 'module_project/producer_form.html', {'form': form})

def get_favorites(request):
    """
    Возвращает HTML с избранными фильмами (данные приходят из JS)
    """
    if request.headers.get('x-requested-with') == 'XMLHttpRequest':
        # Получаем ID избранных фильмов из GET параметров
        favorite_ids = request.GET.getlist('ids[]', [])
        if favorite_ids:
            # Преобразуем строки в числа
            favorite_ids = [int(id) for id in favorite_ids if id.isdigit()]
            films = Film.objects.filter(id__in=favorite_ids).select_related('producer')
        else:
            films = Film.objects.none()
        
        html = render_to_string(
            'module_project/includes/favorites_modal_content.html',
            {'films': films},
            request=request
        )
        return JsonResponse({'html': html, 'count': films.count()})
    
    return JsonResponse({'html': '', 'count': 0})

def get_films_for_wheel(request):
    """
    Возвращает список фильмов для колеса фортуны
    """
    films = Film.objects.select_related('producer').all()[:12]  # Максимум 12 фильмов
    
    films_data = []
    for film in films:
        films_data.append({
            'id': film.id,
            'title': film.title,
            'producer_name': film.producer.name,
            'publication_year': film.publication_year,
            'rating': float(film.rating),
            'cover_image': film.cover_image.url if film.cover_image else None,
        })
    
    return JsonResponse({'films': films_data})