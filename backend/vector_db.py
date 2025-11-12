import os
import chromadb
from chromadb.config import Settings
from pathlib import Path
from typing import List, Dict, Any
import re

class VectorDatabase:
    def __init__(self, persist_directory: str = "./chroma_db"):
        """Initialize ChromaDB vector database"""
        self.persist_directory = persist_directory
        
        # Create the directory if it doesn't exist
        Path(persist_directory).mkdir(parents=True, exist_ok=True)
        
        # Initialize ChromaDB client with persistence
        self.client = chromadb.PersistentClient(path=persist_directory)
        
        # Get or create collection
        self.collection = self.client.get_or_create_collection(
            name="dasa_hospitality_kb",
            metadata={"description": "DASA Hospitality Knowledge Base"}
        )
        
        print(f"✅ Vector database initialized at: {persist_directory}")
        print(f"📊 Current documents in collection: {self.collection.count()}")
    
    def chunk_text(self, text: str, chunk_size: int = 500, overlap: int = 50) -> List[str]:
        """Split text into overlapping chunks"""
        # Split by double newlines (paragraphs) first
        paragraphs = text.split('\n\n')
        
        chunks = []
        current_chunk = ""
        
        for para in paragraphs:
            para = para.strip()
            if not para:
                continue
            
            # If adding this paragraph exceeds chunk size and current_chunk is not empty
            if len(current_chunk) + len(para) > chunk_size and current_chunk:
                chunks.append(current_chunk.strip())
                # Start new chunk with overlap (last few words of previous chunk)
                words = current_chunk.split()
                overlap_text = ' '.join(words[-overlap:]) if len(words) > overlap else current_chunk
                current_chunk = overlap_text + ' ' + para
            else:
                current_chunk += ('\n\n' if current_chunk else '') + para
        
        # Add the last chunk
        if current_chunk:
            chunks.append(current_chunk.strip())
        
        return chunks
    
    def load_knowledge_base(self, file_path: str):
        """Load and process knowledge base from text file"""
        print(f"\n📖 Loading knowledge base from: {file_path}")
        
        if not os.path.exists(file_path):
            print(f"❌ Error: File not found at {file_path}")
            return False
        
        try:
            # Read the file
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            print(f"✅ File loaded successfully. Total characters: {len(content)}")
            
            # Split content by pages
            pages = re.split(r'Page: (.*?)\n', content)
            
            documents = []
            metadatas = []
            ids = []
            
            doc_id = 0
            
            # Process each page
            i = 1  # Start from 1 to skip the header
            while i < len(pages):
                page_title = pages[i].strip() if i < len(pages) else "Unknown"
                page_content = pages[i + 1].strip() if i + 1 < len(pages) else ""
                
                if page_content:
                    # Chunk the page content
                    chunks = self.chunk_text(page_content, chunk_size=600, overlap=100)
                    
                    for chunk_idx, chunk in enumerate(chunks):
                        documents.append(chunk)
                        metadatas.append({
                            "page": page_title,
                            "chunk_id": chunk_idx,
                            "total_chunks": len(chunks),
                            "source": "knowledge_base.txt"
                        })
                        ids.append(f"doc_{doc_id}")
                        doc_id += 1
                
                i += 2  # Move to next page
            
            # Clear existing collection
            existing_count = self.collection.count()
            if existing_count > 0:
                print(f"🗑️  Clearing {existing_count} existing documents...")
                # Delete all existing documents
                existing_ids = self.collection.get()['ids']
                if existing_ids:
                    self.collection.delete(ids=existing_ids)
            
            # Add documents to ChromaDB
            if documents:
                print(f"📝 Adding {len(documents)} document chunks to vector database...")
                self.collection.add(
                    documents=documents,
                    metadatas=metadatas,
                    ids=ids
                )
                print(f"✅ Successfully added {len(documents)} chunks to the database")
                return True
            else:
                print("⚠️  No documents found to add")
                return False
                
        except Exception as e:
            print(f"❌ Error loading knowledge base: {e}")
            return False
    
    def search(self, query: str, n_results: int = 3) -> List[Dict[str, Any]]:
        """Search for relevant documents"""
        try:
            results = self.collection.query(
                query_texts=[query],
                n_results=n_results
            )
            
            # Format results
            formatted_results = []
            if results['documents'] and results['documents'][0]:
                for i, doc in enumerate(results['documents'][0]):
                    formatted_results.append({
                        'content': doc,
                        'metadata': results['metadatas'][0][i] if results['metadatas'] else {},
                        'distance': results['distances'][0][i] if 'distances' in results else None
                    })
            
            return formatted_results
            
        except Exception as e:
            print(f"❌ Error searching database: {e}")
            return []
    
    def get_stats(self) -> Dict[str, Any]:
        """Get database statistics"""
        try:
            count = self.collection.count()
            return {
                "total_documents": count,
                "collection_name": self.collection.name,
                "persist_directory": self.persist_directory
            }
        except Exception as e:
            print(f"❌ Error getting stats: {e}")
            return {}

# Global instance
vector_db = VectorDatabase()
