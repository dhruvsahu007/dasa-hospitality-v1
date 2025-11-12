#!/usr/bin/env python3
"""
Quick Demo - RAG-Enhanced Chatbot
"""
import asyncio
from openai_config import openai_service

async def demo():
    """Demonstrate RAG-enhanced chatbot"""
    print("=" * 70)
    print("🎉 DASA Hospitality - RAG-Enhanced Chatbot Demo")
    print("=" * 70)
    
    # Test queries demonstrating RAG capabilities
    queries = [
        "What services does DASA Hospitality provide?",
        "How much does it cost to work with DASA?",
        "What is the contact information?",
        "Tell me about RevenueMax",
        "What is the property audit process?"
    ]
    
    for i, query in enumerate(queries, 1):
        print(f"\n{'='*70}")
        print(f"Query {i}: {query}")
        print('='*70)
        
        # Get response with RAG
        result = await openai_service.get_chatbot_response(query, use_rag=True)
        
        if result['success']:
            print(f"\n🤖 Response:")
            print(f"{result['response']}")
            print(f"\n📊 Metadata:")
            print(f"   • Context Used: {'✅ Yes' if result['context_used'] else '❌ No'}")
            print(f"   • KB Results: {result['knowledge_base_results']}")
            print(f"   • Model: {result['model_used']}")
        else:
            print(f"❌ Error: {result.get('error', 'Unknown')}")
        
        # Small delay between queries
        if i < len(queries):
            await asyncio.sleep(1)
    
    print(f"\n{'='*70}")
    print("✅ Demo Complete!")
    print("=" * 70)
    print("\n💡 Notice how the chatbot provides accurate, detailed information")
    print("   based on your knowledge base content!")
    print("\n🚀 Your RAG-enhanced chatbot is ready for production!")
    print("=" * 70)

if __name__ == "__main__":
    try:
        asyncio.run(demo())
    except KeyboardInterrupt:
        print("\n\n⚠️  Demo cancelled")
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
