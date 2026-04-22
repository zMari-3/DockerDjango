FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV PORT=8080

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

# Создание папок
RUN mkdir -p /app/staticfiles /app/media /app/data

# Сбор статики
RUN python manage.py collectstatic --noinput

# Открываем порт 8080 (Railway использует этот порт)
EXPOSE 8080

# Запуск с жёстко заданным портом 8080
CMD ["sh", "-c", "python manage.py migrate && gunicorn first_project.wsgi:application --bind 0.0.0.0:8080 --workers 2 --timeout 120 --log-level debug"]