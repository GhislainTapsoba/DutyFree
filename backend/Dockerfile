FROM python:3.10-slim

WORKDIR /app

# Install system dependencies for Postgres and building packages
RUN apt-get update && apt-get install -y \
    libpq-dev gcc netcat-openbsd \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt ./
# Ensure psycopg2-binary and daphne are installed
RUN grep -q psycopg2 requirements.txt || echo "psycopg2-binary>=2.9.9" >> requirements.txt
RUN grep -q daphne requirements.txt || echo "daphne>=4.0.0" >> requirements.txt

RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Nginx needs access to these via volume or collectstatic
RUN mkdir -p /app/staticfiles /app/media

EXPOSE 8000

CMD ["daphne", "-b", "0.0.0.0", "-p", "8000", "backend.asgi:application"]
