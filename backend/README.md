# DASA Hospitality - Backend API

FastAPI backend server for the DASA Hospitality AI Chatbot Demo platform.

## Features

- RESTful API endpoints
- CORS enabled for frontend integration
- Health check endpoint
- Company information API
- Chatbot status API
- Ready for AI chatbot integration

## Project Structure

```
backend/
├── main.py              # FastAPI application
├── requirements.txt     # Python dependencies
├── static/             # Static files (images, etc.)
├── templates/          # HTML templates (legacy)
└── README.md           # This file
```

## Installation & Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Run the FastAPI server:
   ```bash
   python main.py
   ```

4. The API will be available at:
   ```
   http://localhost:8000
   ```

## API Endpoints

### Health Check
- `GET /health` - Check if the API is running

### Company Information
- `GET /api/info` - Get company information and services

### Chatbot Status
- `GET /api/chatbot/status` - Get chatbot status and features

## API Documentation

Once the server is running, you can access the interactive API documentation at:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## CORS Configuration

The API is configured to allow requests from any origin for development. In production, update the `allow_origins` setting in `main.py` to specify your frontend domain.

## Next Steps

This backend is ready for AI chatbot integration. You can add new endpoints for:
- Chat message handling
- User authentication
- Chat history storage
- AI model integration
