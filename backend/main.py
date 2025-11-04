from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Dict
import uvicorn
from aws_config import bedrock_service
from config import validate_config
from database import (
    init_database, 
    save_customer_info, 
    start_chat_session, 
    save_chat_message,
    update_time_spent,
    get_all_customers,
    get_customer_stats,
    update_customer_status,
    update_customer_notes,
    get_customer_notes,
    get_priority_queue,
    delete_customer
)

# Initialize database on startup
init_database()

app = FastAPI(title="DASA Hospitality AI Chatbot API", version="1.0.0")

# Add CORS middleware to allow frontend to connect
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models
class ChatMessage(BaseModel):
    message: str
    user_id: Optional[str] = None

class CustomerInfo(BaseModel):
    name: str
    contact: str
    source: str
    device_info: Dict[str, str]
    time_spent: int = 0

class ChatResponse(BaseModel):
    response: str
    success: bool
    context_used: bool
    knowledge_base_results: int
    model_used: str

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    config_valid = validate_config()
    return {
        "status": "healthy", 
        "message": "DASA Hospitality AI Chatbot API is running",
        "aws_configured": config_valid
    }

@app.get("/api/info")
async def get_company_info():
    """Get company information"""
    return {
        "company": "DASA Hospitality",
        "description": "AI Chatbot Demo Platform with AWS Bedrock",
        "services": [
            "Hotel Revenue Management",
            "Marketing Solutions",
            "AI Chatbot Integration",
            "OTA Management"
        ],
        "ai_features": [
            "AWS Bedrock Integration",
            "Knowledge Base Search",
            "Claude 3 Haiku Model",
            "RAG (Retrieval-Augmented Generation)"
        ]
    }

@app.get("/api/chatbot/status")
async def get_chatbot_status():
    """Get chatbot status"""
    return {
        "status": "active",
        "message": "AI Chatbot is active with AWS Bedrock integration",
        "features": [
            "Guest inquiries handling",
            "Booking assistance", 
            "Revenue optimization",
            "24/7 customer support",
            "Knowledge base search",
            "Professional responses"
        ],
        "ai_model": "Claude 3 Haiku",
        "knowledge_base": "dasa-hospitality-v1"
    }

@app.post("/api/chatbot/message", response_model=ChatResponse)
async def send_chat_message(chat_message: ChatMessage):
    """Send a message to the chatbot and get AI response"""
    try:
        if not chat_message.message.strip():
            raise HTTPException(status_code=400, detail="Message cannot be empty")
        
        # Get response from AWS Bedrock
        result = await bedrock_service.get_chatbot_response(chat_message.message)
        
        if not result["success"]:
            raise HTTPException(status_code=500, detail="Failed to generate response")
        
        return ChatResponse(
            response=result["response"],
            success=result["success"],
            context_used=result.get("context_used", False),
            knowledge_base_results=result.get("knowledge_base_results", 0),
            model_used=result.get("model_used", "unknown")
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@app.get("/api/chatbot/test")
async def test_chatbot():
    """Test the chatbot with a sample message"""
    try:
        test_message = "What services does DASA Hospitality offer?"
        result = await bedrock_service.get_chatbot_response(test_message)
        
        return {
            "test_message": test_message,
            "result": result,
            "status": "success" if result["success"] else "failed"
        }
    except Exception as e:
        return {
            "test_message": "What services does DASA Hospitality offer?",
            "result": {"success": False, "error": str(e)},
            "status": "failed"
        }

@app.post("/api/customer/save")
async def save_customer(customer_info: CustomerInfo, request: Request):
    """Save customer information to database"""
    try:
        # Get client IP address
        ip_address = request.client.host
        if request.headers.get("X-Forwarded-For"):
            ip_address = request.headers.get("X-Forwarded-For").split(",")[0]
        
        # Save to database
        customer_id = save_customer_info(
            name=customer_info.name,
            contact=customer_info.contact,
            source=customer_info.source,
            ip_address=ip_address,
            device_info=customer_info.device_info,
            time_spent=customer_info.time_spent
        )
        
        # Start a chat session
        session_id = start_chat_session(customer_id)
        
        return {
            "success": True,
            "customer_id": customer_id,
            "session_id": session_id,
            "message": "Customer information saved successfully"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save customer info: {str(e)}")

@app.post("/api/customer/update-time")
async def update_customer_time(customer_id: int, time_spent: int):
    """Update time spent on site for a customer"""
    try:
        update_time_spent(customer_id, time_spent)
        return {
            "success": True,
            "message": "Time spent updated successfully"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update time: {str(e)}")

@app.post("/api/chat/save-message")
async def save_message(customer_id: int, session_id: int, message: str, sender: str):
    """Save a chat message"""
    try:
        save_chat_message(customer_id, session_id, message, sender)
        return {
            "success": True,
            "message": "Message saved successfully"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save message: {str(e)}")

@app.get("/api/customers/all")
async def get_customers():
    """Get all customers from database"""
    try:
        customers = get_all_customers()
        customers_list = []
        
        for customer in customers:
            customers_list.append({
                "id": customer[0],
                "name": customer[1],
                "contact": customer[2],
                "source": customer[3],
                "ip_address": customer[4],
                "device_type": customer[5],
                "time_spent_seconds": customer[6],
                "created_at": customer[7],
                "last_active": customer[8],
                "status": customer[9] if len(customer) > 9 else "new",
                "admin_notes": customer[10] if len(customer) > 10 else ""
            })
        
        return {
            "success": True,
            "count": len(customers_list),
            "customers": customers_list
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve customers: {str(e)}")

@app.get("/api/customers/stats")
async def get_stats():
    """Get customer statistics"""
    try:
        stats = get_customer_stats()
        return {
            "success": True,
            "stats": stats
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve stats: {str(e)}")

@app.put("/api/customers/{customer_id}/status")
async def update_status(customer_id: int, status: str):
    """Update customer status"""
    try:
        valid_statuses = ['new', 'contacted', 'in_progress', 'closed']
        if status not in valid_statuses:
            raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of: {valid_statuses}")
        
        update_customer_status(customer_id, status)
        return {
            "success": True,
            "message": f"Customer status updated to {status}"
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update status: {str(e)}")

@app.put("/api/customers/{customer_id}/notes")
async def update_notes(customer_id: int, notes: str):
    """Update customer admin notes"""
    try:
        update_customer_notes(customer_id, notes)
        return {
            "success": True,
            "message": "Notes saved successfully"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update notes: {str(e)}")

@app.get("/api/customers/{customer_id}/notes")
async def get_notes(customer_id: int):
    """Get customer admin notes"""
    try:
        notes = get_customer_notes(customer_id)
        return {
            "success": True,
            "notes": notes
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve notes: {str(e)}")

@app.get("/api/customers/priority-queue")
async def get_priority_leads():
    """Get leads sorted by priority score"""
    try:
        priority_leads = get_priority_queue()
        return {
            "success": True,
            "count": len(priority_leads),
            "leads": priority_leads
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve priority queue: {str(e)}")

@app.delete("/api/customers/{customer_id}")
async def delete_lead(customer_id: int):
    """Delete a customer/lead and all associated data"""
    try:
        success = delete_customer(customer_id)
        if success:
            return {
                "success": True,
                "message": f"Customer {customer_id} deleted successfully"
            }
        else:
            raise HTTPException(status_code=500, detail="Failed to delete customer")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete customer: {str(e)}")

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8001)
