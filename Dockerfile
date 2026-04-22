FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV PORT=8000

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

# Создание необходимых папок
RUN mkdir -p /app/staticfiles /app/media /app/data

# Сбор статических файлов
RUN python manage.py collectstatic --noinput

# Открываем порт (Railway использует переменную PORT)
EXPOSE $PORT

# Запуск приложения
CMD ["sh", "-c", "python manage.py migrate && gunicorn first_project.wsgi:application --bind 0.0.0.0:$PORT"]