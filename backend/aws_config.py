import os
import boto3
from botocore.exceptions import ClientError
from typing import Dict, Any, Optional
import json

class AWSBedrockService:
    def __init__(self):
        """Initialize AWS Bedrock service with credentials"""
        self.region = "us-east-1"
        self.knowledge_base_id = "MBFKZIGLKC"
        
        # Initialize Bedrock client
        self.bedrock_agent_runtime = boto3.client(
            'bedrock-agent-runtime',
            region_name=self.region,
            aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID'),
            aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY')
        )
        
        # Initialize Bedrock client for text generation
        self.bedrock = boto3.client(
            'bedrock-runtime',
            region_name=self.region,
            aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID'),
            aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY')
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
            # Prepare the prompt with context
            if context:
                prompt = f"""You are a chatbot for DASA Hospitality.

Context: {context}

User: {query}

STRICT RULE: Answer in EXACTLY 2-3 SHORT sentences (30-50 words TOTAL). Be direct. No lists, no details, no extra info. Just answer the question briefly."""
            else:
                prompt = f"""You are a chatbot for DASA Hospitality, a hotel revenue management company.

User: {query}

STRICT RULE: Answer in EXACTLY 2-3 SHORT sentences (30-50 words TOTAL). Be direct. No lists, no extra explanations."""
            
            # Use Claude 3 Haiku model
            model_id = "anthropic.claude-3-haiku-20240307-v1:0"
            
            body = {
                "anthropic_version": "bedrock-2023-05-31",
                "max_tokens": 100,
                "messages": [
                    {
                        "role": "user",
                        "content": prompt
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
            
            # Step 2: Extract context from knowledge base results
            context = ""
            if kb_response["success"] and kb_response["retrieval_results"]:
                context_parts = []
                for result in kb_response["retrieval_results"][:3]:  # Use top 3 results
                    content = result.get('content', {}).get('text', '')
                    if content:
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
