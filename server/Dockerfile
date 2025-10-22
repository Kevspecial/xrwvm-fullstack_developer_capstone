# Django app image with built React SPA

# ---------- Frontend build stage ----------
FROM node:18-bullseye-slim AS frontend-builder
WORKDIR /frontend
# Copy only frontend to leverage layer caching
COPY frontend/package.json frontend/package-lock.json* ./
RUN npm ci || npm install
COPY frontend/ ./
RUN npm run build

# ---------- Backend runtime stage ----------
FROM python:3.10-slim-bullseye AS backend
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1
WORKDIR /app

# System deps for Pillow and building wheels
RUN apt-get update \ 
 && apt-get install -y --no-install-recommends build-essential libjpeg62-turbo-dev zlib1g-dev \ 
 && rm -rf /var/lib/apt/lists/*

# Install Python dependencies first for better caching
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy Django project
COPY . ./

# Bring in the built React app so Django can serve it from frontend/build
COPY --from=frontend-builder /frontend/build ./frontend/build

EXPOSE 8000

# Run migrations, collectstatic (non-fatal if not configured), then start Django
CMD ["sh", "-c", "python manage.py migrate && python manage.py collectstatic --noinput || true && python manage.py runserver 0.0.0.0:8000"]
