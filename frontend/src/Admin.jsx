import React, { useState, useEffect } from 'react'
import axios from 'axios'
import './Admin.css'

const API_BASE_URL = 'http://localhost:5005'

// Stats Card Component
function StatsCard({ icon, label, value, badge, color }) {
  return (
    <div className="stats-card">
      <div className="stats-header">
        <div className="stats-icon" style={{ backgroundColor: color }}>
          {icon}
        </div>
        <span className="stats-badge" style={{ backgroundColor: color }}>
          {badge}
        </span>
      </div>
      <div className="stats-value">{value}</div>
      <div className="stats-label">{label}</div>
    </div>
  )
}

// Quick Action Card Component
function QuickActionCard({ icon, title, onClick, highlight }) {
  return (
    <div 
      className={`quick-action-card ${highlight ? 'highlight' : ''}`}
      onClick={onClick}
    >
      <div className="action-icon" style={{ color: highlight ? '#ef4444' : '#6366f1' }}>
        {icon}
      </div>
      <div className="action-title">{title}</div>
    </div>
  )
}

// Priority Lead Card Component (simplified like regular lead card)
function PriorityLeadCard({ lead, onSelect, isSelected }) {
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    })
  }

  const getPriorityBadge = (score) => {
    if (score >= 60) return { level: '🔥 CRITICAL', color: '#dc2626', bgColor: '#fef2f2' }
    if (score >= 40) return { level: '⚡ HIGH', color: '#ea580c', bgColor: '#fff7ed' }
    if (score >= 20) return { level: '⭐ MEDIUM', color: '#f59e0b', bgColor: '#fffbeb' }
    return { level: '✓ LOW', color: '#10b981', bgColor: '#f0fdf4' }
  }

  const priorityInfo = getPriorityBadge(lead.priority_score)

  return (
    <div 
      className={`lead-card ${isSelected ? 'selected' : ''}`}
      onClick={() => onSelect(lead)}
    >
      <div className="lead-card-header">
        <div className="lead-icon">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" fill="#ef4444"/>
            <path d="M16 12L12 8L8 12M12 16V8" stroke="white" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </div>
        <div className="lead-info">
          <h3>{lead.name}</h3>
          <p>{lead.contact}</p>
        </div>
        <span className="lead-status-badge" style={{ 
          backgroundColor: priorityInfo.bgColor,
          color: priorityInfo.color,
          fontWeight: 600
        }}>
          {priorityInfo.level}
        </span>
      </div>
      <div className="lead-details">
        <span>Industry: 🏨 Hospitality</span>
        <span>Date: {formatDate(lead.created_at)}</span>
        <span>Referral: 🔍 {lead.source}</span>
      </div>
      <div className="lead-footer">
        <span className="lead-type">PRIORITY: {lead.priority_score} pts</span>
        <span className="lead-na">⏱️ {Math.floor(lead.time_spent_seconds / 60)}m</span>
      </div>
    </div>
  )
}

// Lead Card Component
function LeadCard({ lead, onSelect, isSelected }) {
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    })
  }

  const getStatusBadge = () => {
    const status = lead.status || 'new'
    const statusMap = {
      'new': 'NEW',
      'contacted': 'CONTACTED',
      'in_progress': 'IN PROGRESS',
      'closed': 'CLOSED'
    }
    return statusMap[status] || 'NEW'
  }

  const getStatusColor = () => {
    const status = lead.status || 'new'
    const colorMap = {
      'new': '#dbeafe',
      'contacted': '#d1fae5',
      'in_progress': '#fef3c7',
      'closed': '#e0e7ff'
    }
    return colorMap[status] || '#dbeafe'
  }

  return (
    <div 
      className={`lead-card ${isSelected ? 'selected' : ''}`}
      onClick={() => onSelect(lead)}
    >
      <div className="lead-card-header">
        <div className="lead-icon">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" fill="#ef4444"/>
            <path d="M16 12L12 8L8 12M12 16V8" stroke="white" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </div>
        <div className="lead-info">
          <h3>{lead.name}</h3>
          <p>{lead.contact}</p>
        </div>
        <span className="lead-status-badge" style={{ backgroundColor: getStatusColor() }}>
          {getStatusBadge()}
        </span>
      </div>
      <div className="lead-details">
        <span>Industry: 🏨 Hospitality</span>
        <span>Date: {formatDate(lead.created_at)}</span>
        <span>Referral: 🔍 {lead.source}</span>
      </div>
      <div className="lead-footer">
        <span className="lead-type">DEMO REQUEST</span>
        <span className="lead-na">N/A</span>
      </div>
    </div>
  )
}

// Lead Detail Sidebar Component
function LeadDetailSidebar({ lead, onClose, onUpdate }) {
  const [notes, setNotes] = useState('')
  const [isSavingNotes, setIsSavingNotes] = useState(false)
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)
  const [isDeletingLead, setIsDeletingLead] = useState(false)
  const [feedbackMessage, setFeedbackMessage] = useState('')

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleString('en-US', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    })
  }

  // Load notes when lead changes
  useEffect(() => {
    if (lead) {
      loadNotes()
    }
  }, [lead?.id])

  const loadNotes = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/customers/${lead.id}/notes`)
      if (response.data.success) {
        setNotes(response.data.notes || '')
      }
    } catch (error) {
      console.error('Error loading notes:', error)
    }
  }

  const handleSaveNotes = async () => {
    setIsSavingNotes(true)
    setFeedbackMessage('')
    try {
      const response = await axios.put(
        `${API_BASE_URL}/api/customers/${lead.id}/notes`,
        null,
        { params: { notes } }
      )
      if (response.data.success) {
        setFeedbackMessage('✅ Notes saved successfully!')
        setTimeout(() => setFeedbackMessage(''), 3000)
      }
    } catch (error) {
      console.error('Error saving notes:', error)
      setFeedbackMessage('❌ Failed to save notes')
      setTimeout(() => setFeedbackMessage(''), 3000)
    } finally {
      setIsSavingNotes(false)
    }
  }

  const handleStatusUpdate = async (status) => {
    setIsUpdatingStatus(true)
    setFeedbackMessage('')
    try {
      const response = await axios.put(
        `${API_BASE_URL}/api/customers/${lead.id}/status`,
        null,
        { params: { status } }
      )
      if (response.data.success) {
        const statusLabels = {
          contacted: 'Contacted',
          in_progress: 'In Progress',
          closed: 'Closed'
        }
        setFeedbackMessage(`✅ Marked as ${statusLabels[status]}!`)
        setTimeout(() => setFeedbackMessage(''), 3000)
        
        // Notify parent to refresh data
        if (onUpdate) {
          onUpdate()
        }
      }
    } catch (error) {
      console.error('Error updating status:', error)
      setFeedbackMessage('❌ Failed to update status')
      setTimeout(() => setFeedbackMessage(''), 3000)
    } finally {
      setIsUpdatingStatus(false)
    }
  }

  const handleDeleteLead = async () => {
    // Show confirmation dialog
    const confirmDelete = window.confirm(
      `Are you sure you want to delete "${lead.name}"?\n\nThis will permanently delete:\n- Lead information\n- Chat history\n- All associated data\n\nThis action cannot be undone.`
    )
    
    if (!confirmDelete) return
    
    setIsDeletingLead(true)
    setFeedbackMessage('')
    try {
      const response = await axios.delete(`${API_BASE_URL}/api/customers/${lead.id}`)
      if (response.data.success) {
        setFeedbackMessage('✅ Lead deleted successfully!')
        setTimeout(() => {
          onClose() // Close the sidebar
          if (onUpdate) {
            onUpdate() // Refresh the data
          }
        }, 1000)
      }
    } catch (error) {
      console.error('Error deleting lead:', error)
      setFeedbackMessage('❌ Failed to delete lead')
      setTimeout(() => setFeedbackMessage(''), 3000)
    } finally {
      setIsDeletingLead(false)
    }
  }

  if (!lead) return null

  return (
    <div className="lead-detail-sidebar">
      <button className="close-sidebar" onClick={onClose}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      </button>

      <div className="lead-detail-header">
        <div className="lead-detail-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" fill="#ef4444"/>
            <path d="M16 12L12 8L8 12M12 16V8" stroke="white" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </div>
        <h2>{lead.name}</h2>
        <span className="detail-status-badge" style={{ 
          backgroundColor: lead.status === 'new' ? '#dbeafe' : 
                          lead.status === 'contacted' ? '#d1fae5' : 
                          lead.status === 'in_progress' ? '#fef3c7' : '#e0e7ff'
        }}>
          {(lead.status || 'new').toUpperCase().replace('_', ' ')}
        </span>
      </div>

      <div className="detail-section">
        <h3>Contact Information</h3>
        <p className="detail-value">{lead.contact}</p>
      </div>

      <div className="detail-section">
        <h3>Details</h3>
        <p className="detail-text">
          Industry: 🏨 Hospitality
        </p>
        <p className="detail-text">
          Date: {formatDate(lead.created_at)}
        </p>
        <p className="detail-text">
          Referral: 🔍 {lead.source}
        </p>
        <p className="detail-text">
          Device: {lead.device_type} | IP: {lead.ip_address || 'N/A'}
        </p>
        <p className="detail-text">
          Time on site: {Math.floor(lead.time_spent_seconds / 60)}m {lead.time_spent_seconds % 60}s
        </p>
      </div>

      {feedbackMessage && (
        <div className="feedback-message">
          {feedbackMessage}
        </div>
      )}

      <div className="detail-section">
        <h3>Admin Notes</h3>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add notes about this lead..."
          className="notes-textarea"
          disabled={isSavingNotes}
        />
        <button 
          className="save-notes-btn" 
          onClick={handleSaveNotes}
          disabled={isSavingNotes}
        >
          {isSavingNotes ? (
            <>
              <div className="spinner-small"></div>
              Saving...
            </>
          ) : (
            'Save Notes'
          )}
        </button>
      </div>

      <div className="detail-section">
        <h3>Actions</h3>
        <button 
          className="action-btn contacted"
          onClick={() => handleStatusUpdate('contacted')}
          disabled={isUpdatingStatus}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M5 13l4 4L19 7" stroke="white" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          Mark as Contacted
        </button>
        <button 
          className="action-btn progress"
          onClick={() => handleStatusUpdate('in_progress')}
          disabled={isUpdatingStatus}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M12 2L15 8L22 9L17 14L18 21L12 18L6 21L7 14L2 9L9 8L12 2Z" fill="white"/>
          </svg>
          Mark in Progress
        </button>
        <button 
          className="action-btn closed"
          onClick={() => handleStatusUpdate('closed')}
          disabled={isUpdatingStatus}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M5 13l4 4L19 7" stroke="white" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          Mark as Closed
        </button>
        <button 
          className="action-btn delete"
          onClick={handleDeleteLead}
          disabled={isDeletingLead}
        >
          {isDeletingLead ? (
            <>
              <div className="spinner-small"></div>
              Deleting...
            </>
          ) : (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6h14z" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                <path d="M10 11v6M14 11v6" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              Delete Lead
            </>
          )}
        </button>
      </div>
    </div>
  )
}

function Admin() {
  const [currentView, setCurrentView] = useState('dashboard') // 'dashboard', 'leads', or 'priority'
  const [stats, setStats] = useState({
    total_customers: 0,
    avg_time_spent: 0,
    source_breakdown: {},
    device_breakdown: {}
  })
  const [customers, setCustomers] = useState([])
  const [priorityLeads, setPriorityLeads] = useState([])
  const [selectedLead, setSelectedLead] = useState(null)
  const [filterStatus, setFilterStatus] = useState('all')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadData()
    // Auto-refresh every 30 seconds
    const interval = setInterval(loadData, 30000)
    return () => clearInterval(interval)
  }, [])

  const loadData = async () => {
    try {
      setIsLoading(true)
      const [statsResponse, customersResponse, priorityResponse] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/customers/stats`),
        axios.get(`${API_BASE_URL}/api/customers/all`),
        axios.get(`${API_BASE_URL}/api/customers/priority-queue`)
      ])

      if (statsResponse.data.success) {
        setStats(statsResponse.data.stats)
      }

      if (customersResponse.data.success) {
        setCustomers(customersResponse.data.customers)
      }

      if (priorityResponse.data.success) {
        setPriorityLeads(priorityResponse.data.leads)
      }
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Calculate counts from status breakdown
  const statusBreakdown = stats.status_breakdown || {}
  const newLeadsCount = statusBreakdown['new'] || 0
  const contactedCount = statusBreakdown['contacted'] || 0
  const closedCount = statusBreakdown['closed'] || 0

  return (
    <div className="admin-container">
      {/* Header */}
      <header className="admin-header">
        <div className="header-left">
          <div className="logo-container">
            <img src="/dasa-logo.png" alt="DASA" className="admin-logo" />
          </div>
          <div className="header-title">
            <h1>DASA Hospitality</h1>
            <p>Admin Dashboard</p>
          </div>
        </div>
        <nav className="header-nav">
          <button 
            className={currentView === 'dashboard' ? 'active' : ''}
            onClick={() => setCurrentView('dashboard')}
          >
            Dashboard
          </button>
          <button 
            className={currentView === 'leads' ? 'active' : ''}
            onClick={() => setCurrentView('leads')}
          >
            Leads
          </button>
          <a href="/" className="back-link">
            ← Back to Site
          </a>
        </nav>
      </header>

      {/* Dashboard View */}
      {currentView === 'dashboard' && (
        <div className="dashboard-content">
          <div className="dashboard-header-section">
            <h2>Admin Dashboard</h2>
            <p className="dashboard-subtitle">Overview of your leads and customer interactions</p>
          </div>

          {/* Stats Grid */}
          <div className="stats-grid">
            <StatsCard
              icon={
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="3" width="7" height="7" fill="white" opacity="0.5"/>
                  <rect x="3" y="14" width="7" height="7" fill="white" opacity="0.7"/>
                  <rect x="14" y="3" width="7" height="7" fill="white" opacity="0.9"/>
                  <rect x="14" y="14" width="7" height="7" fill="white"/>
                </svg>
              }
              label="Total Leads"
              value={stats.total_customers}
              badge="Total"
              color="rgba(99, 102, 241, 0.2)"
            />
            <StatsCard
              icon={
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L15 8L22 9L17 14L18 21L12 18L6 21L7 14L2 9L9 8L12 2Z" fill="white"/>
                </svg>
              }
              label="New Leads"
              value={newLeadsCount}
              badge="New"
              color="rgba(234, 179, 8, 0.2)"
            />
            <StatsCard
              icon={
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="2"/>
                  <circle cx="12" cy="12" r="3" fill="white"/>
                </svg>
              }
              label="Contacted"
              value={contactedCount}
              badge="Active"
              color="rgba(168, 85, 247, 0.2)"
            />
            <StatsCard
              icon={
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M5 13l4 4L19 7" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              }
              label="Deals Closed"
              value={closedCount}
              badge="Closed"
              color="rgba(34, 197, 94, 0.2)"
            />
          </div>

          {/* Quick Actions */}
          <div className="quick-actions-section">
            <h3>Quick Actions</h3>
            <div className="quick-actions-grid">
              <QuickActionCard
                icon={
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                }
                title="View All Leads"
                onClick={() => setCurrentView('leads')}
              />
              <QuickActionCard
                icon={
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" fill="currentColor" opacity="0.2"/>
                    <path d="M16 12L12 8L8 12M12 16V8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                }
                title="Hot Lead AI"
                onClick={() => setCurrentView('priority')}
                highlight={true}
              />
              <QuickActionCard
                icon={
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    <path d="M8 10h.01M12 10h.01M16 10h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                }
                title="Agent Dashboard"
                onClick={() => window.open('/agent.html', '_blank')}
              />
              <QuickActionCard
                icon={
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                }
                title="Settings"
                onClick={() => alert('Settings coming soon!')}
              />
            </div>
          </div>
        </div>
      )}

      {/* Leads View */}
      {currentView === 'leads' && (
        <div className="leads-view">
          <div className="leads-sidebar">
            <h3>Filter Leads</h3>
            <div className="filter-section">
              <label>Status</label>
              <select 
                value={filterStatus} 
                onChange={(e) => setFilterStatus(e.target.value)}
                className="filter-select"
              >
                <option value="all">All Leads ({customers.length})</option>
                <option value="new">New Leads</option>
                <option value="contacted">Contacted</option>
                <option value="closed">Closed</option>
              </select>
            </div>
            <div className="filter-stats">
              <h4>Total Leads</h4>
              <div className="filter-stat-value">{stats.total_customers}</div>
            </div>
          </div>

          <div className="leads-main">
            {isLoading ? (
              <div className="loading-state">
                <div className="spinner"></div>
                <p>Loading leads...</p>
              </div>
            ) : customers.length === 0 ? (
              <div className="empty-state">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                <h3>No leads yet</h3>
                <p>Leads will appear here when customers interact with your chatbot</p>
              </div>
            ) : (
              <div className="leads-list">
                {customers.map((customer) => (
                  <LeadCard
                    key={customer.id}
                    lead={customer}
                    onSelect={setSelectedLead}
                    isSelected={selectedLead?.id === customer.id}
                  />
                ))}
              </div>
            )}
          </div>

          {selectedLead && (
            <LeadDetailSidebar
              lead={selectedLead}
              onClose={() => setSelectedLead(null)}
              onUpdate={loadData}
            />
          )}
        </div>
      )}

      {/* Hot Lead AI View (Priority Queue) */}
      {currentView === 'priority' && (
        <div className="leads-view">
          <div className="leads-sidebar">
            <h3>Hot Lead AI</h3>
            <div className="filter-section">
              <label>AI-Ranked Leads</label>
              <p className="filter-description">
                Sorted by engagement + source value
              </p>
            </div>
            <div className="filter-stats">
              <h4>Active Leads</h4>
              <div className="filter-stat-value">{priorityLeads.length}</div>
            </div>
            <div className="filter-stats" style={{ marginTop: '1rem' }}>
              <h4>🔥 Critical</h4>
              <div className="filter-stat-value">
                {priorityLeads.filter(l => l.priority_score >= 60).length}
              </div>
            </div>
            <div className="filter-stats" style={{ marginTop: '1rem' }}>
              <h4>⚡ High Priority</h4>
              <div className="filter-stat-value">
                {priorityLeads.filter(l => l.priority_score >= 40 && l.priority_score < 60).length}
              </div>
            </div>
          </div>

          <div className="leads-main">
            {isLoading ? (
              <div className="loading-state">
                <div className="spinner"></div>
                <p>Loading hot leads...</p>
              </div>
            ) : priorityLeads.length === 0 ? (
              <div className="empty-state">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                <h3>No active leads</h3>
                <p>Hot leads will appear here based on AI ranking</p>
              </div>
            ) : (
              <div className="leads-list">
                {priorityLeads.map((lead) => (
                  <PriorityLeadCard
                    key={lead.id}
                    lead={lead}
                    onSelect={setSelectedLead}
                    isSelected={selectedLead?.id === lead.id}
                  />
                ))}
              </div>
            )}
          </div>

          {selectedLead && (
            <LeadDetailSidebar
              lead={selectedLead}
              onClose={() => setSelectedLead(null)}
              onUpdate={loadData}
            />
          )}
        </div>
      )}
    </div>
  )
}

export default Admin

