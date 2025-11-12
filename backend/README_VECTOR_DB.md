# ChromaDB Vector Database Setup Guide

## Overview
DASA Hospitality chatbot now uses ChromaDB for Retrieval-Augmented Generation (RAG) to provide accurate, context-aware responses based on your knowledge base.

## ✅ What's Been Set Up

### 1. Vector Database (ChromaDB)
- **Location:** `./chroma_db/` directory
- **Collection:** `dasa_hospitality_kb`
- **Documents:** 121 chunks from your knowledge base
- **Embedding Model:** all-MiniLM-L6-v2 (automatic, from Sentence Transformers)

### 2. Files Created

**Core Files:**
- `vector_db.py` - Vector database service
- `knowledge_base.txt` - Your knowledge base content
- `init_vector_db.py` - Initialize/reload the database
- `test_vector_db.py` - Test RAG functionality

**Updated Files:**
- `openai_config.py` - Now includes RAG support
- `requirements.txt` - Added ChromaDB dependencies

## 🚀 Quick Start

### Initialize Vector Database
```bash
cd backend
python init_vector_db.py
```

This will:
- Load `knowledge_base.txt`
- Split content into chunks
- Create embeddings
- Store in ChromaDB
- Test the setup

### Test RAG System
```bash
python test_vector_db.py
```

This will:
- Query the vector database
- Test with OpenAI
- Show context-aware responses

### Start Server with RAG
```bash
python main.py
```

The chatbot now automatically uses RAG to answer questions!

## 📊 How It Works

1. **User asks a question** → "What services does DASA offer?"
2. **Vector search** → Finds 3 most relevant chunks from knowledge base
3. **Context injection** → Adds relevant info to the prompt
4. **OpenAI response** → GPT generates answer based on your data
5. **Accurate reply** → User gets precise information

## 🔧 Configuration

### Chunk Size & Overlap
In `vector_db.py`:
```python
chunks = self.chunk_text(page_content, chunk_size=600, overlap=100)
```

### Number of Search Results
In `openai_config.py`:
```python
search_results = vector_db.search(query, n_results=3)
```

### OpenAI Token Limit
```python
max_tokens=200  # Adjust as needed
```

## 📝 Updating Knowledge Base

### Add New Content
1. Edit `knowledge_base.txt`
2. Run `python init_vector_db.py`
3. Restart server

### Format
Keep the same format:
```
Page: Page Title (/url)
Content goes here...

Page: Another Page (/another-url)
More content...
```

## 🧪 Testing

### Test Vector Search Only
```python
from vector_db import vector_db
results = vector_db.search("your question", n_results=3)
print(results)
```

### Test RAG with OpenAI
```python
from openai_config import openai_service
result = await openai_service.get_chatbot_response("your question", use_rag=True)
print(result)
```

### Disable RAG (Optional)
```python
result = await openai_service.get_chatbot_response("your question", use_rag=False)
```

## 📈 Performance

### Current Setup
- **121 document chunks** in database
- **Search time:** <100ms
- **Response quality:** High (context-aware)
- **Storage:** ~5MB (persistent)

### Statistics
```python
from vector_db import vector_db
stats = vector_db.get_stats()
print(stats)
```

## 🔍 Search Quality

The vector database uses semantic search:
- Understands meaning, not just keywords
- Finds relevant content even with different wording
- Ranks results by relevance

**Example:**
- Query: "How much do you charge?"
- Matches: pricing, cost, fees, payment terms

## 🐛 Troubleshooting

### Database Not Found
```bash
python init_vector_db.py
```

### No Search Results
- Check `knowledge_base.txt` has content
- Re-initialize: `python init_vector_db.py`

### NumPy Version Error
```bash
pip install "numpy<2.0" --force-reinstall
```

### Tokenizer Warnings
These are harmless. To suppress:
```bash
export TOKENIZERS_PARALLELISM=false
```

## 💡 Tips

1. **Better Responses:**
   - Keep knowledge base updated
   - Use clear, structured content
   - Include common questions

2. **Performance:**
   - Chunk size affects relevance
   - More results = more context but slower
   - Balance n_results (3-5 optimal)

3. **Quality:**
   - Test after updates
   - Monitor user feedback
   - Refine content based on common queries

## 📚 Maintenance

### Regular Tasks
- Update `knowledge_base.txt` monthly
- Re-initialize after major changes
- Test search quality
- Monitor response accuracy

### Backup
The `chroma_db/` folder contains your vector database. Back it up regularly.

## 🆘 Support

### Common Issues

**Q: Chatbot gives wrong information**
A: Check if knowledge base is current, re-initialize DB

**Q: Slow responses**
A: Reduce `n_results` or `max_tokens`

**Q: Not finding content**
A: Improve knowledge base structure, add more detail

### Contact
For technical issues: Check error logs in terminal

## 🎉 Success Metrics

✅ **121 documents** indexed
✅ **Semantic search** working
✅ **RAG integration** complete
✅ **OpenAI responses** enhanced with context
✅ **Persistent storage** enabled

Your chatbot is now intelligent and context-aware!
