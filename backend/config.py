import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# OpenAI Configuration
OPENAI_API_KEY = os.getenv('OPENAI_API_KEY', '')

# AWS Configuration (Backup - not currently used)
# AWS_ACCESS_KEY_ID = os.getenv('AWS_ACCESS_KEY_ID', '')
# AWS_SECRET_ACCESS_KEY = os.getenv('AWS_SECRET_ACCESS_KEY', '')
# AWS_DEFAULT_REGION = os.getenv('AWS_DEFAULT_REGION', 'us-east-1')
# KNOWLEDGE_BASE_ID = os.getenv('KNOWLEDGE_BASE_ID', 'MBFKZIGLKC')

# Validate required environment variables
def validate_config():
    required_vars = ['OPENAI_API_KEY']
    missing_vars = [var for var in required_vars if not os.getenv(var)]
    
    if missing_vars:
        print(f"Warning: Missing required environment variables: {missing_vars}")
        print("Please set OPENAI_API_KEY in your .env file")
        return False
    
    # Check if API key is still the placeholder
    api_key = os.getenv('OPENAI_API_KEY', '')
    if api_key == 'your_openai_api_key_here' or not api_key:
        print("Warning: OPENAI_API_KEY is not configured properly")
        print("Please replace 'your_openai_api_key_here' with your actual OpenAI API key")
        return False
    
    return True
