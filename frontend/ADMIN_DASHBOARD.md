# DASA Hospitality - Admin Dashboard

Modern admin dashboard inspired by InstaLogic design, built with React for managing leads and customer interactions.

## 🎨 Design Overview

The new admin dashboard features a clean, modern interface with:
- **Light theme** with gradient backgrounds
- **Card-based layouts** for statistics
- **InstaLogic-inspired design** - professional and intuitive
- **Fully responsive** - works on all devices
- **Real-time data** - auto-refreshes every 30 seconds

## 🚀 Features

### Dashboard View

#### Statistics Cards
- **Total Leads** - All customers who interacted with the chatbot
- **New Leads** - Recent customer inquiries
- **Contacted** - Customers that have been reached out to
- **Deals Closed** - Successful conversions

#### Quick Actions
1. **View All Leads** - Navigate to leads management page
2. **Priority Queue** - View high-priority leads (highlighted in yellow)
3. **Agent Dashboard** - Opens agent support interface in new window
4. **Settings** - Configuration and preferences

### Leads Management View

#### Features:
- **Filter Sidebar** - Filter leads by status
  - All Leads
  - New Leads
  - Contacted
  - Closed
  
- **Lead Cards** - Display key information
  - Customer name and contact
  - Industry, date, referral source
  - Status badge (NEW/CONTACTED/CLOSED)
  - Demo request indicator

- **Detail Sidebar** - When clicking a lead
  - Full contact information
  - Customer details (device, IP, time spent)
  - Admin notes section (save notes about leads)
  - Action buttons:
    - ✅ Mark as Contacted (green)
    - ⭐ Mark in Progress (orange)
    - ✅ Mark as Closed (blue)

## 🎯 Navigation

### URL Structure
- **Dashboard Home**: `http://localhost:3000/admin.html`
- **Leads View**: Click "Leads" in header or "View All Leads" card
- **Agent Dashboard**: Click "Agent Dashboard" card (opens in new window)

### Header Navigation
- **Dashboard** - Main overview with stats
- **Leads** - Lead management interface
- **← Back to Site** - Return to customer-facing website

## 🔗 Integration with Existing System

### Agent Dashboard Integration
The admin dashboard replaces the old "Generate Report" quick action with "Agent Dashboard":

```jsx
<QuickActionCard
  title="Agent Dashboard"
  onClick={() => window.open('/agent.html', '_blank')}
/>
```

This opens the agent support interface in a new window, allowing admins to:
- Monitor customer conversations
- See agent activity
- Manage support requests

### Data Source
All data comes from the existing FastAPI backend:
- `GET /api/customers/stats` - Statistics
- `GET /api/customers/all` - Customer list
- Data updates automatically every 30 seconds

## 📱 Responsive Design

### Desktop (1200px+)
- Three-column layout for leads view
- Side-by-side cards and actions
- Full feature access

### Tablet (768px - 1200px)
- Two-column layout
- Sidebar becomes fixed overlay
- Optimized spacing

### Mobile (< 768px)
- Single column layout
- Collapsible navigation
- Touch-optimized interface
- Full functionality maintained

## 🎨 Color Scheme

### Primary Colors
- **Primary Blue**: `#6366f1` - Main actions and highlights
- **Success Green**: `#10b981` - Positive actions
- **Warning Orange**: `#f59e0b` - In-progress status
- **Error Red**: `#ef4444` - Priority indicators

### Neutral Colors
- **Background**: `#f5f7fa` - Page background
- **Card White**: `#ffffff` - Card backgrounds
- **Text Dark**: `#1e293b` - Primary text
- **Text Gray**: `#64748b` - Secondary text

## 🔧 Customization

### Modifying Stats Cards
Edit `Admin.jsx` in the `stats-grid` section:

```jsx
<StatsCard
  icon={<svg>...</svg>}
  label="Your Metric"
  value={yourValue}
  badge="Badge Text"
  color="rgba(99, 102, 241, 0.2)"
/>
```

### Adding Quick Actions
Add new quick action cards:

```jsx
<QuickActionCard
  icon={<svg>...</svg>}
  title="New Action"
  onClick={() => yourFunction()}
  highlight={false} // true for yellow highlight
/>
```

### Styling
All styles are in `Admin.css`:
- `.stats-card` - Statistics card styling
- `.quick-action-card` - Quick action buttons
- `.lead-card` - Lead list items
- `.lead-detail-sidebar` - Detail panel

## 🚀 Development

### Running Locally
```bash
cd frontend
npm run dev
```
Navigate to: `http://localhost:3000/admin.html`

### Building for Production
```bash
npm run build
```
Outputs optimized files to `dist/` directory including `admin.html`.

## 🔄 Data Flow

```
User Action (Admin Dashboard)
        ↓
React Component State Update
        ↓
API Call to Backend (FastAPI)
        ↓
Database Query (SQLite)
        ↓
Response to Frontend
        ↓
UI Update & Re-render
```

### Auto-Refresh
Dashboard automatically fetches new data every 30 seconds:

```javascript
useEffect(() => {
  loadData()
  const interval = setInterval(loadData, 30000)
  return () => clearInterval(interval)
}, [])
```

## 🎯 Use Cases

### For Marketing Teams
- Track lead sources (Google, Social Media, Referral)
- Monitor conversion rates
- Identify high-value leads

### For Sales Teams
- Manage lead pipeline
- Add notes to customer records
- Track customer engagement time

### For Support Teams
- Access agent dashboard directly
- Monitor response times
- View customer device/browser info

### For Management
- Overview of key metrics
- Real-time performance tracking
- Data-driven decision making

## 🔐 Security Features

- **No authentication** (demo mode)
- API calls over CORS-enabled backend
- No sensitive data exposed in frontend
- All customer data from secure backend API

*For production, implement JWT authentication and role-based access control.*

## 🚧 Future Enhancements

Potential additions to admin dashboard:

1. **Advanced Filtering**
   - Date range filters
   - Custom field searches
   - Saved filter presets

2. **Analytics Charts**
   - Line charts for trends
   - Pie charts for source breakdown
   - Conversion funnel visualization

3. **Bulk Actions**
   - Select multiple leads
   - Bulk status updates
   - Export to CSV

4. **User Management**
   - Admin authentication
   - Role-based permissions
   - Activity logs

5. **Email Integration**
   - Send emails from dashboard
   - Email templates
   - Automated follow-ups

6. **Real-time Updates**
   - WebSocket integration
   - Live notification badges
   - Push notifications

7. **Reports & Export**
   - Generate PDF reports
   - CSV/Excel export
   - Scheduled reports

## 📊 Comparison: Old vs New

### Old Admin Panel (`admin.html`)
- ❌ Standalone HTML file
- ❌ Dark theme with tables
- ❌ Limited interactivity
- ❌ No lead management
- ✅ Simple statistics

### New Admin Dashboard (`Admin.jsx`)
- ✅ React-based SPA
- ✅ Modern light theme
- ✅ Fully interactive
- ✅ Complete lead management
- ✅ Detailed analytics
- ✅ Agent integration
- ✅ Mobile responsive
- ✅ InstaLogic-inspired design

## 💡 Tips

1. **Quick Lead Review**: Click any lead card to see details instantly
2. **Keyboard Navigation**: Use Tab to navigate between actions
3. **Multi-Window**: Open agent dashboard in separate window for monitoring
4. **Refresh Manually**: Data auto-refreshes, but you can reload page anytime
5. **Mobile Access**: Full functionality available on mobile devices

## 🐛 Troubleshooting

### Issue: No data showing
**Solution**: 
- Ensure backend is running on port 8001
- Check browser console for API errors
- Verify customers exist in database

### Issue: Lead cards not clickable
**Solution**:
- Check if leads array has data
- Verify onClick handler is attached
- Look for JavaScript errors in console

### Issue: Styling looks broken
**Solution**:
- Clear browser cache
- Ensure `Admin.css` is imported in `Admin.jsx`
- Check for conflicting global styles

### Issue: Agent dashboard link not working
**Solution**:
- Verify `agent.html` exists
- Check if running on correct port (3000)
- Ensure popup blocker is disabled

## 📖 Related Documentation

- [Main README](../README.md) - Project overview
- [Agent Setup](./AGENT_SETUP.md) - Agent dashboard documentation
- [Frontend README](./README.md) - React app documentation
- [Backend README](../backend/README.md) - API documentation

---

Built with ❤️ for DASA Hospitality

