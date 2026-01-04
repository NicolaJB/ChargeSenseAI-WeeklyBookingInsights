# Use lightweight Python 3.10
FROM python:3.10-slim

# Set working directory in container
WORKDIR /app

# Copy only requirements first to leverage Docker cache
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy all backend code
COPY . .

# Expose port 8000 (used by Azure / Render)
EXPOSE 8000

# Set environment variable for production
ENV PYTHONUNBUFFERED=1

# Command to run FastAPI
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
