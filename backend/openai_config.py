import os
from typing import Dict, Any
from dotenv import load_dotenv
from pathlib import Path
import openai

# Load environment variables from .env file
backend_dir = Path(__file__).parent
env_path = backend_dir / '.env'
load_dotenv(env_path)

# Import vector database (lazy import to avoid circular dependencies)
try:
    from vector_db import vector_db
    VECTOR_DB_AVAILABLE = True
except Exception as e:
    print(f"Warning: Vector DB not available: {e}")
    VECTOR_DB_AVAILABLE = False
    vector_db = None

class OpenAIService:
    def __init__(self):
        """Initialize OpenAI service with API key"""
        self.api_key = os.getenv('OPENAI_API_KEY')
        
        if not self.api_key or self.api_key == 'your_openai_api_key_here':
            print("Warning: OpenAI API key not found or not set in environment variables")
            print("Please set OPENAI_API_KEY in the .env file")
        else:
            openai.api_key = self.api_key
    
    async def get_chatbot_response(self, query: str, use_rag: bool = True) -> Dict[str, Any]:
        """
        Generate a response using OpenAI GPT model with RAG (Retrieval-Augmented Generation)
        """
        try:
            # Step 1: Search for relevant context from vector database
            context_parts = []
            kb_results_count = 0
            
            if use_rag and VECTOR_DB_AVAILABLE and vector_db:
                try:
                    search_results = vector_db.search(query, n_results=3)
                    kb_results_count = len(search_results)
                    
                    if search_results:
                        for result in search_results:
                            context_parts.append(result['content'])
                except Exception as e:
                    print(f"Warning: Vector DB search failed: {e}")
            
            # Step 2: Build context string
            context = "\n\n".join(context_parts) if context_parts else ""
            
            # Step 3: System message defining the AI agent's role
            system_message = """You are the DASA Hospitality AI agent - a helpful AI assistant for DASA Hospitality.

IMPORTANT RULES:
- You represent DASA Hospitality Pvt. Ltd., a leading hotel revenue management and marketing company
- Provide accurate information about DASA's services, pricing, processes, and policies
- Be professional, friendly, and helpful
- If you don't know something, admit it and suggest contacting the team directly

SERVICES OVERVIEW:
- RevenueMax: OTA and online marketing for revenue growth
- FrontDesk360: Remote front office and customer support
- ReputationPro: Online reputation management
- SocialEdge: Social media marketing
- MailConnect: Email marketing
- Property Audit: Detailed performance analysis
- Online Channel Management: OTA management
- Holiday Home Management: Complete rental property management

RESPONSE RULES:
- Answer in 2-4 SHORT sentences (40-80 words)
- Be direct and informative
- Use context provided to give accurate answers
- Professional and conversational tone"""
            
            # Step 4: Build user message with context
            if context:
                user_message = f"""Based on the following information about DASA Hospitality:

{context}

User Question: {query}

Please provide a helpful and accurate response based on the context above."""
            else:
                user_message = query
            
            # Step 5: Make API call to OpenAI
            response = openai.ChatCompletion.create(
                model="gpt-3.5-turbo",  # You can change to "gpt-4" if you have access
                messages=[
                    {"role": "system", "content": system_message},
                    {"role": "user", "content": user_message}
                ],
                max_tokens=200,
                temperature=0.7
            )
            
            generated_text = response.choices[0].message.content.strip()
            
            return {
                "success": True,
                "response": generated_text,
                "context_used": bool(context),
                "knowledge_base_results": kb_results_count,
                "model_used": response.model
            }
            
        except openai.error.AuthenticationError:
            print("OpenAI Authentication Error: Invalid API key")
            return {
                "success": False,
                "response": "I apologize, but the AI service is not properly configured. Please contact support.",
                "error": "Authentication failed",
                "context_used": False,
                "knowledge_base_results": 0,
                "model_used": "unknown"
            }
        except openai.error.RateLimitError:
            print("OpenAI Rate Limit Error: Too many requests")
            return {
                "success": False,
                "response": "I apologize, but the service is currently experiencing high demand. Please try again in a moment.",
                "error": "Rate limit exceeded",
                "context_used": False,
                "knowledge_base_results": 0,
                "model_used": "unknown"
            }
        except Exception as e:
            print(f"Error generating response with OpenAI: {e}")
            return {
                "success": False,
                "response": "I apologize, but I'm having trouble processing your request right now. Please try again later.",
                "error": str(e),
                "context_used": False,
                "knowledge_base_results": 0,
                "model_used": "unknown"
            }

# Global instance
openai_service = OpenAIService()
