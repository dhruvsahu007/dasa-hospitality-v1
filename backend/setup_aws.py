#!/usr/bin/env python3
"""
AWS Bedrock Setup Script for DASA Hospitality Chatbot
This script helps you set up AWS credentials for the Bedrock integration.
"""

import os
import sys

def setup_aws_credentials():
    """Interactive setup for AWS credentials"""
    print("🔧 AWS Bedrock Setup for DASA Hospitality Chatbot")
    print("=" * 50)
    
    # Check if .env file exists
    env_file = ".env"
    if os.path.exists(env_file):
        print(f"✅ Found existing {env_file} file")
        overwrite = input("Do you want to update the credentials? (y/n): ").lower().strip()
        if overwrite != 'y':
            print("Setup cancelled.")
            return
    
    # Get AWS credentials
    print("\n📝 Please provide your AWS credentials:")
    print("(These will be stored in .env file for local development)")
    
    access_key = input("AWS Access Key ID: ").strip()
    secret_key = input("AWS Secret Access Key: ").strip()
    
    if not access_key or not secret_key:
        print("❌ Error: Both Access Key ID and Secret Access Key are required!")
        return
    
    # Create .env file
    env_content = f"""# AWS Bedrock Configuration
AWS_ACCESS_KEY_ID={access_key}
AWS_SECRET_ACCESS_KEY={secret_key}
AWS_DEFAULT_REGION=us-east-1

# Knowledge Base Configuration
KNOWLEDGE_BASE_ID=MBFKZIGLKC
"""
    
    try:
        with open(env_file, 'w') as f:
            f.write(env_content)
        
        print(f"\n✅ Successfully created {env_file} file")
        print("\n📋 Configuration Summary:")
        print(f"   Region: us-east-1")
        print(f"   Knowledge Base ID: MBFKZIGLKC")
        print(f"   Model: Claude 3 Haiku")
        
        print("\n🚀 Next Steps:")
        print("1. Install dependencies: pip install -r requirements.txt")
        print("2. Start the backend: python main.py")
        print("3. Test the API: curl http://localhost:8001/health")
        print("4. Test chatbot: curl http://localhost:8001/api/chatbot/test")
        
    except Exception as e:
        print(f"❌ Error creating {env_file}: {e}")

def test_aws_connection():
    """Test AWS Bedrock connection"""
    print("\n🧪 Testing AWS Bedrock Connection...")
    
    try:
        from aws_config import bedrock_service
        from config import validate_config
        
        if not validate_config():
            print("❌ AWS credentials not configured properly")
            return False
        
        print("✅ AWS credentials configured")
        print("✅ Bedrock service initialized")
        print("✅ Ready to use AWS Bedrock!")
        return True
        
    except Exception as e:
        print(f"❌ Error testing AWS connection: {e}")
        return False

if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "test":
        test_aws_connection()
    else:
        setup_aws_credentials()
