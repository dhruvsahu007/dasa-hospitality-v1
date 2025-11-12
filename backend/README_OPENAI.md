# OpenAI Integration Guide

## Overview
The DASA Hospitality chatbot has been migrated from AWS Bedrock to OpenAI's GPT API.

## Setup Instructions

### 1. Get Your OpenAI API Key

1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Sign up or log in to your account
3. Navigate to [API Keys](https://platform.openai.com/api-keys)
4. Click "Create new secret key"
5. Copy the API key (it starts with `sk-...`)

### 2. Configure the API Key

Edit the `.env` file in the backend directory:

```bash
# OpenAI Configuration
OPENAI_API_KEY=sk-your-actual-api-key-here
```

**Important:** Replace `your_openai_api_key_here` with your actual OpenAI API key.

### 3. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

Or specifically install OpenAI:

```bash
pip install openai==0.28.1
```

### 4. Run the Server

```bash
cd backend
python main.py
```

Or with uvicorn:

```bash
uvicorn main:app --reload --port 8001
```

## Features

- **Model:** GPT-3.5-Turbo (can be upgraded to GPT-4 if you have access)
- **Max Tokens:** 150 tokens per response
- **Temperature:** 0.7 (balanced creativity)
- **Response Style:** Concise, 2-3 sentences (30-50 words)

## API Endpoints

All endpoints remain the same:

- `GET /health` - Health check
- `GET /api/chatbot/status` - Chatbot status
- `POST /api/chatbot/message` - Send message to chatbot
- `GET /api/chatbot/test` - Test chatbot

## Upgrade to GPT-4

To use GPT-4 instead of GPT-3.5-Turbo, edit `openai_config.py`:

```python
response = openai.ChatCompletion.create(
    model="gpt-4",  # Changed from "gpt-3.5-turbo"
    messages=[...],
    ...
)
```

**Note:** GPT-4 requires a paid OpenAI account with GPT-4 access and costs more per token.

## Cost Estimation

- **GPT-3.5-Turbo:** ~$0.002 per 1,000 tokens
- **GPT-4:** ~$0.03 per 1,000 tokens (input) + $0.06 per 1,000 tokens (output)

For a typical chat with 100 tokens input and 50 tokens output:
- GPT-3.5: ~$0.0003 per conversation
- GPT-4: ~$0.006 per conversation

## Troubleshooting

### Authentication Error
```
Error: OpenAI Authentication Error: Invalid API key
```
**Solution:** Check that your API key is correct in the `.env` file.

### Rate Limit Error
```
Error: OpenAI Rate Limit Error: Too many requests
```
**Solution:** You've exceeded your rate limit. Wait a moment or upgrade your OpenAI plan.

### Import Error
```
ImportError: No module named 'openai'
```
**Solution:** Install the OpenAI package:
```bash
pip install openai==0.28.1
```

## Reverting to AWS Bedrock

If you need to switch back to AWS Bedrock:

1. Uncomment AWS credentials in `.env`
2. In `main.py`, change:
   ```python
   from openai_config import openai_service
   ```
   to:
   ```python
   from aws_config import bedrock_service
   ```
3. Replace all `openai_service` calls with `bedrock_service`
4. Install boto3: `pip install boto3`

## Support

For issues or questions:
- OpenAI Documentation: https://platform.openai.com/docs
- OpenAI Community: https://community.openai.com/
