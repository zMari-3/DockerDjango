FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# Установка системных зависимостей
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Установка Python-зависимостей
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Копирование проекта
COPY . .

# Создаём папки и собираем статику
RUN mkdir -p /app/staticfiles /app/media /app/data && \
    DJANGO_SECRET_KEY=build-dummy-key python manage.py collectstatic --noinput

# Открываем порт
EXPOSE 8000

# Команда запуска через gunicorn
CMD ["sh", "-c", "python manage.py migrate && gunicorn first_project.wsgi:application --bind 0.0.0.0:8000"]