#!/usr/bin/env python3
"""
Initialize ChromaDB Vector Database with DASA Hospitality Knowledge Base
"""
import sys
from pathlib import Path

# Add backend directory to path
backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))

from vector_db import vector_db

def main():
    """Initialize the vector database"""
    print("=" * 70)
    print("DASA Hospitality - Vector Database Initialization")
    print("=" * 70)
    
    # Path to knowledge base file
    kb_file = backend_dir / "knowledge_base.txt"
    
    if not kb_file.exists():
        print(f"\n❌ Error: Knowledge base file not found at {kb_file}")
        print("Please ensure 'knowledge_base.txt' exists in the backend directory.")
        sys.exit(1)
    
    # Load knowledge base into vector database
    print(f"\n🚀 Starting vector database initialization...")
    success = vector_db.load_knowledge_base(str(kb_file))
    
    if success:
        # Get and display stats
        stats = vector_db.get_stats()
        print("\n" + "=" * 70)
        print("✅ Vector Database Initialized Successfully!")
        print("=" * 70)
        print(f"📊 Total Documents: {stats.get('total_documents', 0)}")
        print(f"📁 Collection: {stats.get('collection_name', 'N/A')}")
        print(f"💾 Location: {stats.get('persist_directory', 'N/A')}")
        print("\n🎉 Your chatbot is now ready to use RAG with the knowledge base!")
        print("=" * 70)
        
        # Test search
        print("\n🧪 Testing search functionality...")
        test_query = "What services does DASA Hospitality offer?"
        results = vector_db.search(test_query, n_results=2)
        
        if results:
            print(f"\n✅ Search test successful! Found {len(results)} relevant documents")
            print(f"\nTest Query: '{test_query}'")
            print("\nTop Result Preview:")
            print("-" * 70)
            preview = results[0]['content'][:200] + "..." if len(results[0]['content']) > 200 else results[0]['content']
            print(preview)
            print("-" * 70)
        else:
            print("⚠️  Search test returned no results")
        
        print("\n✅ Setup complete! You can now start the server with: python main.py")
    else:
        print("\n❌ Failed to initialize vector database")
        print("Please check the error messages above and try again.")
        sys.exit(1)

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n⚠️  Initialization cancelled by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ Unexpected error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
