from dotenv import load_dotenv
import os
import boto3

# Force reload environment
load_dotenv(r'd:\Desktop\Dasa-Hospitality\backend\.env', override=True)

print("=" * 60)
print("ENVIRONMENT VARIABLES")
print("=" * 60)
print(f"AWS_ACCESS_KEY_ID: {os.getenv('AWS_ACCESS_KEY_ID')[:10]}...")
print(f"AWS_SECRET_ACCESS_KEY: {'*' * 20}")
print(f"AWS_DEFAULT_REGION: {os.getenv('AWS_DEFAULT_REGION')}")
print()

# Create STS client with explicit credentials
sts = boto3.client(
    'sts',
    region_name='us-east-1',
    aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID'),
    aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY')
)

identity = sts.get_caller_identity()
print("=" * 60)
print("AWS IDENTITY")
print("=" * 60)
print(f"User ARN: {identity['Arn']}")
print(f"Account: {identity['Account']}")
print(f"User ID: {identity['UserId']}")
print("=" * 60)
