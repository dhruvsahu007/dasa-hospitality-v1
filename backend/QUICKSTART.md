# 🚀 Quick Start Guide - OpenAI Integration

## ⚠️ IMPORTANT: AWS Bedrock is currently down

The system has been migrated to **OpenAI GPT-3.5-Turbo** as an alternative.

---

## 📋 What You Need

1. **OpenAI API Key** (Get it from: https://platform.openai.com/api-keys)
2. **Python 3.8+** (Already installed ✅)
3. **OpenAI package** (Already installed ✅)

---

## 🎯 Setup in 3 Steps

### Step 1: Get Your OpenAI API Key

Visit: **https://platform.openai.com/api-keys**

1. Sign in or create an account
2. Click "Create new secret key"
3. Copy the key (starts with `sk-...`)

### Step 2: Add Your API Key

**Option A - Use the setup script (Easiest):**
```bash
cd backend
python setup_openai.py
```

**Option B - Edit manually:**
```bash
cd backend
nano .env  # or use any text editor
```

Replace this line:
```
OPENAI_API_KEY=your_openai_api_key_here
```

With your actual key:
```
OPENAI_API_KEY=sk-your-actual-key-here
```

### Step 3: Test & Run

**Test the integration:**
```bash
cd backend
python test_openai.py
```

**Start the server:**
```bash
python main.py
```

The server will run on: **http://localhost:8001**

---

## 🧪 Quick Test

After starting the server, visit:
- Health check: http://localhost:8001/health
- Chatbot test: http://localhost:8001/api/chatbot/test

Or use curl:
```bash
curl http://localhost:8001/api/chatbot/test
```

---

## 📝 What Changed?

| Before | After |
|--------|-------|
| AWS Bedrock | OpenAI GPT |
| Claude 3 Haiku | GPT-3.5-Turbo |
| Knowledge Base | Direct AI |
| AWS Credentials | OpenAI API Key |

---

## ✅ All Working?

If you see:
```
✅ OpenAI integration is working correctly!
```

You're all set! 🎉

---

## ❌ Troubleshooting

### "Authentication Error"
→ Check your API key in `.env` file
→ Make sure it starts with `sk-`
→ Get a new key from https://platform.openai.com/api-keys

### "Rate Limit Error"
→ You've exceeded free tier limits
→ Wait a few minutes or upgrade your OpenAI plan

### "Module not found: openai"
→ Run: `pip install openai==0.28.1`

---

## 💰 Cost

**GPT-3.5-Turbo Pricing:**
- ~$0.002 per 1,000 tokens
- ~$0.0003 per typical conversation

**Free tier:** $5 credit for new accounts

Monitor usage: https://platform.openai.com/usage

---

## 📚 Documentation

- Full setup guide: `README_OPENAI.md`
- Migration details: `MIGRATION_SUMMARY.md`
- Test script: `test_openai.py`
- Setup script: `setup_openai.py`

---

## 🔄 Need to Switch Back to Bedrock?

When AWS Bedrock is back online:
1. Uncomment AWS credentials in `.env`
2. See `MIGRATION_SUMMARY.md` for detailed steps

---

## 🆘 Support

- OpenAI Docs: https://platform.openai.com/docs
- OpenAI Status: https://status.openai.com
- OpenAI Community: https://community.openai.com

---

**Made with ❤️ for DASA Hospitality**
