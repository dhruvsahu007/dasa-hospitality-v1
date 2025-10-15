import boto3
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

print("=" * 70)
print("AWS BEDROCK PERMISSION DIAGNOSTIC")
print("=" * 70)

# Get identity
sts = boto3.client('sts', region_name='us-east-1')
identity = sts.get_caller_identity()

print(f"\n✅ Authenticated as: {identity['Arn']}")
print(f"Account ID: {identity['Account']}")

# Test Knowledge Base access
bedrock_agent = boto3.client('bedrock-agent-runtime', region_name='us-east-1')

print(f"\n🔍 Testing Knowledge Base: MBFKZIGLKC")
print("=" * 70)

try:
    response = bedrock_agent.retrieve(
        knowledgeBaseId='MBFKZIGLKC',
        retrievalQuery={'text': 'DASA Hospitality services'},
        retrievalConfiguration={
            'vectorSearchConfiguration': {
                'numberOfResults': 2
            }
        }
    )
    
    print("✅ ✅ ✅ SUCCESS! Knowledge Base access is WORKING! ✅ ✅ ✅")
    print(f"\nRetrieved {len(response.get('retrievalResults', []))} results")
    
    if response.get('retrievalResults'):
        print("\n📚 Sample result:")
        first_result = response['retrievalResults'][0]
        content = first_result.get('content', {}).get('text', '')[:200]
        print(f"{content}...")
    
except Exception as e:
    error_msg = str(e)
    print(f"❌ FAILED: {error_msg}\n")
    
    if "AccessDeniedException" in error_msg:
        print("⚠️  PERMISSION ISSUE DETECTED")
        print("\nYou need to add this IAM policy to your user:")
        print("-" * 70)
        print("""{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "bedrock:Retrieve",
                "bedrock:RetrieveAndGenerate"
            ],
            "Resource": "arn:aws:bedrock:us-east-1:926944000247:knowledge-base/MBFKZIGLKC"
        }
    ]
}""")
        print("-" * 70)
        print("\n📝 Steps to fix:")
        print("1. Go to AWS IAM Console → Users → BedrockAPIKey-edlq")
        print("2. Click 'Add permissions' → 'Create inline policy'")
        print("3. Click 'JSON' tab and paste the policy above")
        print("4. Name it: 'DASA-Bedrock-KB-Access'")
        print("5. Click 'Create policy'")
        print("6. Wait 30-60 seconds for propagation")
        print("7. Run this script again")

print("=" * 70)
