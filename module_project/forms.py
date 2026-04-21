# forms.py
from django import forms
from .models import Film, Producer

class ProducerForm(forms.ModelForm):
    class Meta:
        model = Producer
        fields = ['name', 'birth_year', 'country']
        widgets = {
            'name': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Имя режиссёра'}),
            'birth_year': forms.NumberInput(attrs={'class': 'form-control', 'placeholder': 'Год рождения'}),
            'country': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Страна'}),
        }

class FilmForm(forms.ModelForm):
    class Meta:
        model = Film
        fields = ['title', 'producer', 'publication_year', 'rating', 'age_limit', 'description', 'cover_image']
        widgets = {
            'title': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Название фильма'}),
            'producer': forms.Select(attrs={'class': 'form-control'}),
            'publication_year': forms.NumberInput(attrs={'class': 'form-control', 'placeholder': 'Год выхода'}),
            'rating': forms.NumberInput(attrs={'class': 'form-control', 'placeholder': 'Рейтинг', 'min': 0, 'max': 10, 'step': '0.1'}),
            'age_limit': forms.NumberInput(attrs={'class': 'form-control', 'placeholder': 'Возрастное ограничение', 'min': 0, 'max': 21}),
            'description': forms.Textarea(attrs={'class': 'form-control', 'rows': 4, 'placeholder': 'Описание фильма'}),
            'cover_image': forms.FileInput(attrs={'class': 'form-control'}),
        }
    def clean_rating(self):
        rating = self.cleaned_data.get('rating')
        if rating is not None:
            if rating < 0 or rating > 10:
                raise forms.ValidationError('Рейтинг должен быть от 0 до 10')
        return rating

class FilmSearchForm(forms.Form):
    query = forms.CharField(
        required=False,
        label='Поиск',
        widget=forms.TextInput(attrs={
            'class': 'form-control',
            'placeholder': 'Название или режиссёр...',
            'id': 'search-query' # ID для JS
        })
    )
    year = forms.IntegerField(
        required=False,
        label='Год',
        widget=forms.NumberInput(attrs={
            'class': 'form-control', 
            'placeholder': 'Год выхода', 
            'id': 'year'
        })
    )
    rating_min = forms.FloatField(
        required=False,
        label='Рейтинг от',
        widget=forms.NumberInput(attrs={'class': 'form-control', 'placeholder': 'Мин', 'min': 0, 'max': 10, 'step': '0.1', 'id': 'rating-min'})
    )
    age_limit = forms.IntegerField(
        required=False,
        label='Воз. огранич',
        widget=forms.NumberInput(attrs={'class': 'form-control', 'placeholder': 'Возраст', 'id': 'age-limit'})
    )