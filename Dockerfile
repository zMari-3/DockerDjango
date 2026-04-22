FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends gcc \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

RUN mkdir -p /app/staticfiles /app/media /app/data
RUN python manage.py collectstatic --noinput

EXPOSE 8000 8080

# Используем PORT из переменных окружения Railway
CMD ["sh", "-c", "python manage.py migrate && gunicorn first_project.wsgi:application --bind 0.0.0.0:${PORT:-8000}"]