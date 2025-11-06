import os
import boto3
from botocore.exceptions import ClientError
from typing import Dict, Any, Optional
import json
from dotenv import load_dotenv
from pathlib import Path

# Load environment variables from .env file
# Get the directory where this file is located (backend directory)
backend_dir = Path(__file__).parent
env_path = backend_dir / '.env'
# Load .env from backend directory (python-dotenv accepts Path objects)
load_dotenv(env_path)

class AWSBedrockService:
    def __init__(self):
        """Initialize AWS Bedrock service with credentials"""
        self.region = os.getenv('AWS_DEFAULT_REGION', 'us-east-1')
        self.knowledge_base_id = os.getenv('KNOWLEDGE_BASE_ID', 'MBFKZIGLKC')
        
        # Get AWS credentials from environment
        aws_access_key_id = os.getenv('AWS_ACCESS_KEY_ID')
        aws_secret_access_key = os.getenv('AWS_SECRET_ACCESS_KEY')
        
        # Check if credentials are available
        if not aws_access_key_id or not aws_secret_access_key:
            print("Warning: AWS credentials not found in environment variables")
            print("Please ensure AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY are set in .env file")
        
        # Initialize Bedrock client with credentials if provided, otherwise use default boto3 credential chain
        client_kwargs = {
            'region_name': self.region
        }
        
        if aws_access_key_id and aws_secret_access_key:
            client_kwargs['aws_access_key_id'] = aws_access_key_id
            client_kwargs['aws_secret_access_key'] = aws_secret_access_key
        
        # Initialize Bedrock client
        self.bedrock_agent_runtime = boto3.client(
            'bedrock-agent-runtime',
            **client_kwargs
        )
        
        # Initialize Bedrock client for text generation
        self.bedrock = boto3.client(
            'bedrock-runtime',
            **client_kwargs
        )

    async def query_knowledge_base(self, query: str) -> Dict[str, Any]:
        """
        Query the DASA Hospitality knowledge base
        """
        try:
            response = self.bedrock_agent_runtime.retrieve(
                knowledgeBaseId=self.knowledge_base_id,
                retrievalQuery={
                    'text': query
                },
                retrievalConfiguration={
                    'vectorSearchConfiguration': {
                        'numberOfResults': 5
                    }
                }
            )
            
            return {
                "success": True,
                "retrieval_results": response.get('retrievalResults', []),
                "query_id": response.get('queryId', '')
            }
            
        except ClientError as e:
            print(f"Error querying knowledge base: {e}")
            return {
                "success": False,
                "error": str(e),
                "retrieval_results": []
            }

    async def generate_response(self, query: str, context: str = "") -> Dict[str, Any]:
        """
        Generate a response using Claude 3 Haiku model
        """
        try:
            # Use Claude 3 Haiku model
            model_id = "anthropic.claude-3-haiku-20240307-v1:0"
            
            # System message defining the AI agent's role - STRICT AND EXPLICIT
            system_message = """You are the DASA Hospitality AI agent - a general AI assistant for DASA Hospitality.

CRITICAL IDENTITY RULES (NEVER VIOLATE):
- You are a GENERAL AI AGENT for DASA Hospitality
- You are NOT a social media manager
- You are NOT a social media specialist
- You NEVER mention "social media management" or "social media services"
- You NEVER say you help with "social media needs" or "online presence"
- You are a general AI assistant that helps with DASA Hospitality services, properties, bookings, and general inquiries
- When greeting, say: "Hello! I'm DASA Hospitality AI agent. How can I help you with DASA Hospitality today?"
- If context mentions social media, IGNORE IT COMPLETELY - do not mention it in your response
- Focus only on DASA Hospitality services, properties, hotels, bookings, and general hospitality topics"""
            
            # Prepare user prompt with context - add explicit filtering instructions
            if context:
                # Filter out social media mentions from context if present
                filtered_context = context
                # Add explicit instruction to ignore social media content
                user_prompt = f"""IMPORTANT: Ignore any mentions of "social media", "social media management", or "social media services" in the context below. Do NOT reference social media in your response.

Context: {filtered_context}

User: {query}

STRICT RULES:
- Answer in EXACTLY 2-3 SHORT sentences (30-50 words TOTAL)
- Be direct. No lists, no details, no extra info
- NEVER mention social media, social media management, or social media services
- If context talks about social media, ignore it completely
- Just answer the question briefly about DASA Hospitality general services"""
            else:
                user_prompt = f"""User: {query}

STRICT RULE: Answer in EXACTLY 2-3 SHORT sentences (30-50 words TOTAL). Be direct. No lists, no extra explanations. NEVER mention social media."""
            
            body = {
                "anthropic_version": "bedrock-2023-05-31",
                "max_tokens": 100,
                "system": system_message,
                "messages": [
                    {
                        "role": "user",
                        "content": user_prompt
                    }
                ]
            }
            
            response = self.bedrock.invoke_model(
                modelId=model_id,
                body=json.dumps(body),
                contentType="application/json"
            )
            
            response_body = json.loads(response['body'].read())
            generated_text = response_body['content'][0]['text']
            
            return {
                "success": True,
                "response": generated_text,
                "model_used": model_id
            }
            
        except ClientError as e:
            print(f"Error generating response: {e}")
            return {
                "success": False,
                "error": str(e),
                "response": "I apologize, but I'm having trouble processing your request right now. Please try again later."
            }

    async def get_chatbot_response(self, query: str) -> Dict[str, Any]:
        """
        Complete chatbot flow: query knowledge base + generate response
        """
        try:
            # Step 1: Query knowledge base
            kb_response = await self.query_knowledge_base(query)
            
            # Step 2: Extract context from knowledge base results - FILTER OUT SOCIAL MEDIA CONTENT
            context = ""
            if kb_response["success"] and kb_response["retrieval_results"]:
                context_parts = []
                social_media_keywords = ['social media', 'social media management', 'social media services', 
                                       'online presence', 'social media strategy', 'social media marketing']
                
                for result in kb_response["retrieval_results"][:3]:  # Use top 3 results
                    content = result.get('content', {}).get('text', '')
                    if content:
                        # Filter out content that is primarily about social media
                        content_lower = content.lower()
                        is_social_media_content = any(keyword in content_lower for keyword in social_media_keywords)
                        
                        # Only include content if it's not primarily about social media
                        if not is_social_media_content:
                            context_parts.append(content)
                
                context = "\n\n".join(context_parts)
            
            # Step 3: Generate response with context
            response = await self.generate_response(query, context)
            
            return {
                "success": response["success"],
                "response": response["response"],
                "context_used": bool(context),
                "knowledge_base_results": len(kb_response.get("retrieval_results", [])),
                "model_used": response.get("model_used", "unknown")
            }
            
        except Exception as e:
            print(f"Error in chatbot response: {e}")
            return {
                "success": False,
                "response": "I apologize, but I'm experiencing technical difficulties. Please try again later.",
                "error": str(e)
            }

# Global instance
bedrock_service = AWSBedrockService()
