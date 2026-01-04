# Use Python 3.10 slim image
FROM python:3.10-slim

# Set working directory
WORKDIR /app

# Copy only requirements first to leverage caching
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code
COPY . .

# Expose port (App Service or container apps will map this)
EXPOSE 8000

# Command to run FastAPI
CMD ["uvicorn", "chargesenseai-backend.app.main:app", "--host", "0.0.0.0", "--port", "8000"]
