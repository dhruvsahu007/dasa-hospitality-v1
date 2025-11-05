# 🔥 Priority Queue System - Complete Guide

## ✅ Implementation Complete!

The DASA Hospitality admin dashboard now has an **intelligent priority queue** that ranks leads based on:
1. ⏱️ **Time spent on site** (1 point per minute)
2. 🎯 **Referral source bonus** (up to +50 points)

---

## 🎯 **How the Priority Scoring Works**

### Base Score Calculation
```
Base Score = Time Spent (seconds) / 60
Example: 5 minutes = 5 points
```

### Source Bonus Points
| Source Type | Bonus Points | Why? |
|-------------|--------------|------|
| **Referral** | +50 pts | Highest value - warm lead from existing customer |
| **Advertisement** | +30 pts | Paid traffic - invested money |
| **Social Media** | +20 pts | Engaged audience |
| **Google Search** | +10 pts | Active searcher |
| **Other** | +0 pts | Standard traffic |

### Total Priority Score
```
Priority Score = Base Score + Source Bonus

Examples:
- Lead from Referral, 10min on site: 10 + 50 = 60 pts (CRITICAL)
- Lead from Google, 8min on site: 8 + 10 = 18 pts (LOW)
- Lead from Ad, 15min on site: 15 + 30 = 45 pts (HIGH)
```

---

## 🎨 **Priority Levels**

### Visual Color-Coding

| Level | Score Range | Color | Meaning |
|-------|-------------|-------|---------|
| 🔴 **CRITICAL** | 60+ pts | Red | Urgent - Contact immediately! |
| 🟠 **HIGH** | 40-59 pts | Orange | Important - High priority |
| 🟡 **MEDIUM** | 20-39 pts | Yellow | Standard priority |
| 🟢 **LOW** | 0-19 pts | Green | Normal follow-up |

---

## 📊 **Priority Queue Features**

### 1. **Smart Ranking**
- ✅ Leads automatically sorted by priority score (highest first)
- ✅ Rank numbers (#1, #2, #3...) 
- ✅ Real-time score calculation
- ✅ Excludes closed leads

### 2. **Visual Dashboard**
```
🔥 Priority Queue

📊 Stats Bar:
- 👥 Active Leads (total count)
- 🔥 Critical (60+ points)
- ⚡ High (40-59 points)
```

### 3. **Priority Lead Cards**
Each card shows:
- **Rank**: #1, #2, #3...
- **Priority Score**: 65 pts (color-coded)
- **Priority Level**: CRITICAL badge
- **Customer Info**: Name, contact
- **Engagement**: Time spent, source, date
- **Score Breakdown**:
  - Time Score: +15 pts
  - Source Bonus: +50 pts

### 4. **Score Breakdown**
Transparent calculation shown:
```
Time Score: +15 pts    (15 minutes on site)
Source Bonus: +50 pts  (Referral source)
─────────────────
Total: 65 pts         (CRITICAL priority)
```

---

## 🚀 **How to Use**

### Step 1: Access Priority Queue
1. Open admin dashboard: `http://localhost:3000/admin.html`
2. Click **"Priority Queue"** card (highlighted in yellow)
3. View leads ranked by priority

### Step 2: Review High-Priority Leads
- Start from #1 (highest score)
- Check CRITICAL (red) and HIGH (orange) leads first
- Click any lead to see full details

### Step 3: Take Action
- Click lead → Sidebar opens
- Review customer info
- Add notes
- Mark as Contacted/Progress/Closed
- Move to next high-priority lead

---

## 💡 **Best Practices**

### Daily Workflow
1. **Morning**: Check Priority Queue for CRITICAL leads
2. **Contact**: Reach out to top 5 ranked leads
3. **Update**: Mark leads as "Contacted" or "In Progress"
4. **Afternoon**: Follow up on HIGH priority leads
5. **End of Day**: Review and plan for next day

### Why It Matters
- ⏱️ **Time is trust**: Visitors who spend more time are more interested
- 🤝 **Referrals convert better**: They come pre-qualified
- 🎯 **Focus on hot leads**: Don't waste time on low-engagement visitors

---

## 📈 **Example Scenarios**

### Scenario 1: CRITICAL Lead
```
Lead Details:
- Name: John Doe
- Source: Referral
- Time on Site: 12 minutes
- Priority Score: 62 pts

Calculation:
- Base: 12 mins = 12 pts
- Referral Bonus: +50 pts
- Total: 62 pts → CRITICAL

Action: Contact immediately - referral + high engagement!
```

### Scenario 2: HIGH Lead
```
Lead Details:
- Name: Jane Smith  
- Source: Advertisement
- Time on Site: 20 minutes
- Priority Score: 50 pts

Calculation:
- Base: 20 mins = 20 pts
- Ad Bonus: +30 pts
- Total: 50 pts → HIGH

Action: High priority - paid lead with good engagement
```

### Scenario 3: LOW Lead
```
Lead Details:
- Name: Bob Wilson
- Source: Google Search
- Time on Site: 2 minutes
- Priority Score: 12 pts

Calculation:
- Base: 2 mins = 2 pts
- Google Bonus: +10 pts
- Total: 12 pts → LOW

Action: Standard follow-up when time permits
```

---

## 🔧 **Technical Implementation**

### Backend (Python)

#### Priority Calculation Function
```python
def calculate_priority_score(time_spent_seconds, source):
    # Base: 1 point per minute
    base_score = time_spent_seconds / 60
    
    # Source bonuses
    if 'referral' in source.lower():
        bonus = 50
    elif 'advertisement' in source.lower():
        bonus = 30
    elif 'social media' in source.lower():
        bonus = 20
    elif 'google search' in source.lower():
        bonus = 10
    else:
        bonus = 0
    
    return round(base_score + bonus, 2)
```

#### API Endpoint
```python
GET /api/customers/priority-queue

Response:
{
  "success": true,
  "count": 5,
  "leads": [
    {
      "id": 1,
      "name": "John Doe",
      "priority_score": 62.0,
      "time_spent_seconds": 720,
      "source": "Referral",
      ...
    }
  ]
}
```

### Frontend (React)

#### Priority Lead Card
- Displays rank, score, and level
- Color-coded by priority
- Shows score breakdown
- Click to see full details

#### Auto-Refresh
- Fetches priority queue every 30 seconds
- Updates ranking automatically
- Real-time score calculations

---

## 📊 **Priority Queue Statistics**

### What You'll See

```
┌─────────────────────────────────────────┐
│  🔥 Priority Queue                      │
│  Leads ranked by engagement + source    │
├─────────────────────────────────────────┤
│  👥 12 Active Leads                     │
│  🔥 3 Critical  ⚡ 4 High              │
└─────────────────────────────────────────┘

#1  │ 65 pts │ CRITICAL │ John Doe
    ⏱️ 15min  🔍 Referral  📅 11/04

#2  │ 50 pts │ HIGH     │ Jane Smith
    ⏱️ 20min  🔍 Advertisement  📅 11/04

#3  │ 38 pts │ MEDIUM   │ Bob Wilson
    ⏱️ 18min  🔍 Social Media  📅 11/03
```

---

## 🎯 **Customization Options**

### Adjust Source Bonuses
Edit `backend/database.py`:
```python
def calculate_priority_score(time_spent_seconds, source):
    # Customize these values:
    if 'referral' in source.lower():
        referral_bonus = 50  # Change this
    elif 'advertisement' in source.lower():
        referral_bonus = 30  # Change this
    # ... etc
```

### Change Priority Levels
Edit `frontend/src/Admin.jsx`:
```javascript
const getPriorityLevel = (score) => {
  if (score >= 60) return 'CRITICAL'  // Adjust threshold
  if (score >= 40) return 'HIGH'      // Adjust threshold
  if (score >= 20) return 'MEDIUM'    // Adjust threshold
  return 'LOW'
}
```

---

## 📱 **Mobile Responsive**

The priority queue is fully mobile-optimized:
- ✅ Stacked cards on mobile
- ✅ Touch-friendly interface
- ✅ Readable scores and badges
- ✅ Full functionality maintained

---

## 🧪 **Testing**

### Create Test Data

1. **Generate leads with different sources:**
   - Customer 1: Referral, 10min → HIGH score
   - Customer 2: Google, 3min → LOW score
   - Customer 3: Advertisement, 15min → HIGH score

2. **Open Priority Queue:**
   ```
   http://localhost:3000/admin.html
   Click "Priority Queue" button
   ```

3. **Verify Ranking:**
   - Leads should be sorted by score (highest first)
   - Referral with good time should rank #1
   - Color coding should match score ranges

---

## 💡 **Tips for Maximum Effectiveness**

1. **Focus on CRITICAL first**
   - These are your hottest leads
   - Referrals + high engagement
   - Contact within 1 hour

2. **Set daily goals**
   - Contact top 10 priority leads daily
   - Track conversion rates by priority level
   - Adjust bonuses based on results

3. **Use filters strategically**
   - Priority Queue shows active leads only
   - Closed leads automatically excluded
   - Focus on new and in-progress

4. **Monitor trends**
   - Which sources generate highest scores?
   - Average time for conversions?
   - Best time to contact high-priority leads?

---

## 🎉 **Benefits**

### For Sales Teams
- ✅ Never miss a hot lead
- ✅ Focus time on high-value prospects
- ✅ Data-driven prioritization

### For Management
- ✅ Track lead quality by source
- ✅ ROI on different channels
- ✅ Team performance metrics

### For Customer Success
- ✅ Better response times
- ✅ Higher conversion rates
- ✅ Improved customer experience

---

## 🔄 **Integration with Workflow**

### Priority Queue → Actions
1. Click high-priority lead
2. Review customer info
3. Add notes from conversation
4. Mark as "Contacted"
5. Set follow-up reminders
6. Move to next priority lead

### Dashboard → Priority Queue
- Quick action card always visible
- One-click access to sorted leads
- Real-time score updates

---

## 📞 **Support**

### Common Questions

**Q: Why is a short-visit referral ranked high?**
A: Referrals get +50 bonus points even with low engagement time.

**Q: Can I change the point values?**
A: Yes! Edit `calculate_priority_score()` in `backend/database.py`

**Q: Do closed leads appear?**
A: No, priority queue only shows active leads (new/contacted/in_progress)

**Q: How often does it refresh?**
A: Every 30 seconds automatically

**Q: Can I manually refresh?**
A: Yes, switch views or reload the page

---

## ✅ **Success Checklist**

- [x] Priority scoring algorithm implemented
- [x] API endpoint for priority queue created
- [x] Frontend priority queue view built
- [x] Visual ranking with #1, #2, #3...
- [x] Color-coded priority levels
- [x] Score breakdown transparency
- [x] Statistics dashboard
- [x] Mobile responsive design
- [x] Auto-refresh functionality
- [x] Integration with lead details

---

## 🚀 **Ready to Use!**

Your priority queue is **fully functional** and ready to help you focus on the leads that matter most!

**Access it now:**
1. Start backend: `cd backend && python main.py`
2. Start frontend: `cd frontend && npm run dev`
3. Open: `http://localhost:3000/admin.html`
4. Click: **"Priority Queue"** card

**Happy lead prioritizing! 🎯**

---

*DASA Hospitality - Smart Lead Management*  
*Powered by engagement analytics + source intelligence*

