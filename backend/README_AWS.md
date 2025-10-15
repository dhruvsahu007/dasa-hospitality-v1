# AWS Bedrock Integration - DASA Hospitality Chatbot

This document explains how to set up and use AWS Bedrock with the DASA Hospitality chatbot.

## 🏗️ Architecture

```
Frontend (React) → Backend (FastAPI) → AWS Bedrock → Knowledge Base
                                    ↓
                              Claude 3 Haiku Model
```

## 📋 Prerequisites

1. **AWS Account** with Bedrock access
2. **Knowledge Base**: `dasa-hospitality-v1` (ID: MBFKZIGLKC)
3. **Region**: us-east-1
4. **Model**: Claude 3 Haiku
5. **Python 3.8+**

## 🔧 Setup Instructions

### 1. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. Configure AWS Credentials

**Option A: Using Setup Script (Recommended)**
```bash
python setup_aws.py
```

**Option B: Manual Setup**
Create a `.env` file in the backend directory:
```env
AWS_ACCESS_KEY_ID=your_access_key_here
AWS_SECRET_ACCESS_KEY=your_secret_key_here
AWS_DEFAULT_REGION=us-east-1
KNOWLEDGE_BASE_ID=MBFKZIGLKC
```

**Option C: AWS CLI Configuration**
```bash
aws configure
```

### 3. Test AWS Connection

```bash
python setup_aws.py test
```

### 4. Start the Backend

```bash
python main.py
```

## 🚀 API Endpoints

### Health Check
```bash
GET /health
```
Returns API status and AWS configuration status.

### Send Chat Message
```bash
POST /api/chatbot/message
Content-Type: application/json

{
  "message": "What services does DASA Hospitality offer?",
  "user_id": "optional_user_id"
}
```

**Response:**
```json
{
  "response": "DASA Hospitality offers comprehensive hotel revenue management...",
  "success": true,
  "context_used": true,
  "knowledge_base_results": 3,
  "model_used": "anthropic.claude-3-haiku-20240307-v1:0"
}
```

### Test Chatbot
```bash
GET /api/chatbot/test
```
Tests the chatbot with a sample message.

## 🧠 Knowledge Base Details

- **Name**: dasa-hospitality-v1
- **ID**: MBFKZIGLKC
- **Type**: Vector store with OpenSearch Serverless
- **Embeddings**: Titan Embeddings G1 - Text v1.2
- **Data Source**: Web crawler (https://www.dasahospitality.com/)
- **Vector Dimensions**: 1536

## 🔄 How It Works

1. **User sends message** via React frontend
2. **Backend receives** message via FastAPI
3. **Knowledge Base Query**: Searches dasa-hospitality-v1 for relevant content
4. **Context Retrieval**: Extracts top 3 most relevant results
5. **Claude 3 Haiku**: Generates response using retrieved context
6. **Response**: Returns AI-generated answer with metadata

## 🎯 Features

### RAG (Retrieval-Augmented Generation)
- Queries knowledge base for relevant information
- Uses retrieved context to generate accurate responses
- Provides source attribution

### Professional Responses
- Claude 3 Haiku model for high-quality responses
- Hospitality industry expertise
- Corporate tone and style

### Real-time Processing
- Typing indicators
- Loading states
- Error handling

## 🛠️ Troubleshooting

### Common Issues

1. **AWS Credentials Not Found**
   ```
   Error: AWS credentials not configured
   ```
   **Solution**: Run `python setup_aws.py` to configure credentials

2. **Knowledge Base Not Found**
   ```
   Error: Knowledge base MBFKZIGLKC not found
   ```
   **Solution**: Verify knowledge base ID and region

3. **Permission Denied**
   ```
   Error: Access denied to Bedrock
   ```
   **Solution**: Check IAM permissions for Bedrock access

4. **Model Not Available**
   ```
   Error: Model anthropic.claude-3-haiku not available
   ```
   **Solution**: Enable Claude 3 Haiku in Bedrock console

### Debug Mode

Enable debug logging:
```python
import logging
logging.basicConfig(level=logging.DEBUG)
```

## 📊 Monitoring

### Health Check Response
```json
{
  "status": "healthy",
  "message": "DASA Hospitality AI Chatbot API is running",
  "aws_configured": true
}
```

### Response Metadata
- `context_used`: Whether knowledge base was queried
- `knowledge_base_results`: Number of sources found
- `model_used`: AI model used for generation

## 🔒 Security

- AWS credentials stored in `.env` file (not committed to git)
- IAM roles with minimal required permissions
- CORS configured for frontend access
- Input validation and sanitization

## 📈 Performance

- **Knowledge Base Query**: ~200-500ms
- **Claude 3 Haiku Generation**: ~1-3s
- **Total Response Time**: ~2-4s
- **Concurrent Requests**: Handled by FastAPI

## 🚀 Production Deployment

1. **Environment Variables**: Use secure secret management
2. **IAM Roles**: Use IAM roles instead of access keys
3. **Monitoring**: Set up CloudWatch logging
4. **Scaling**: Consider Lambda for serverless deployment

## 📞 Support

For issues with:
- **AWS Bedrock**: Check AWS documentation
- **Knowledge Base**: Verify in Bedrock console
- **API Integration**: Check backend logs
- **Frontend**: Check browser console
