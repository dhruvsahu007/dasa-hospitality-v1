import React, { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import './Agent.css'

const API_BASE_URL = 'http://localhost:8001'

function Agent() {
  const [queue, setQueue] = useState([])
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [messages, setMessages] = useState([])
  const [agentInputMessage, setAgentInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const agentMessagesEndRef = useRef(null)
  const agentInputRef = useRef(null)

  // Fetch queue periodically
  useEffect(() => {
    const fetchQueue = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/agent/queue`)
        if (response.data.success) {
          setQueue(response.data.queue || [])
        }
      } catch (error) {
        console.error('Failed to fetch queue:', error)
      }
    }

    fetchQueue() // Initial fetch
    const interval = setInterval(fetchQueue, 5000) // Refresh every 5 seconds

    return () => clearInterval(interval)
  }, [])

  // Fetch messages when customer is selected
  useEffect(() => {
    if (selectedCustomer) {
      fetchCustomerMessages(selectedCustomer.id)
      // Mark customer as in_progress if they're new
      if (selectedCustomer.status === 'new') {
        updateCustomerStatus(selectedCustomer.id, 'in_progress')
      }
    } else {
      setMessages([])
    }
  }, [selectedCustomer])

  // Poll for new messages when customer is selected
  useEffect(() => {
    if (!selectedCustomer) return

    const interval = setInterval(() => {
      fetchCustomerMessages(selectedCustomer.id)
    }, 3000) // Poll every 3 seconds

    return () => clearInterval(interval)
  }, [selectedCustomer])

  const fetchCustomerMessages = async (customerId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/customers/${customerId}/messages`)
      if (response.data.success) {
        // Convert backend format to frontend format
        const formattedMessages = response.data.messages.map(msg => ({
          id: msg.id,
          text: msg.text,
          sender: msg.sender === 'user' ? 'customer' : msg.sender,
          timestamp: new Date(msg.timestamp).toLocaleTimeString()
        }))
        setMessages(formattedMessages)
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error)
    }
  }

  const updateCustomerStatus = async (customerId, status) => {
    try {
      await axios.put(`${API_BASE_URL}/api/customers/${customerId}/status`, null, {
        params: { status }
      })
      // Refresh queue to update status
      const response = await axios.get(`${API_BASE_URL}/api/agent/queue`)
      if (response.data.success) {
        setQueue(response.data.queue || [])
        // Update selected customer if it's the same one
        if (selectedCustomer && selectedCustomer.id === customerId) {
          const updated = response.data.queue.find(c => c.id === customerId)
          if (updated) setSelectedCustomer(updated)
        }
      }
    } catch (error) {
      console.error('Failed to update status:', error)
    }
  }

  const handleSelectCustomer = (customer) => {
    setSelectedCustomer(customer)
    setAgentInputMessage('')
  }

  const handleAgentSendMessage = async (e) => {
    e.preventDefault()
    if (!agentInputMessage.trim() || !selectedCustomer || isSending) return

    setIsSending(true)
    const messageText = agentInputMessage.trim()

    try {
      // Save message to backend using agent endpoint
      await axios.post(`${API_BASE_URL}/api/agent/send-message`, null, {
        params: {
          customer_id: selectedCustomer.id,
          message: messageText
        }
      })

      // Add message to local state immediately
      const agentMessage = {
        id: Date.now(),
        text: messageText,
        sender: 'agent',
        timestamp: new Date().toLocaleTimeString()
      }
      setMessages(prev => [...prev, agentMessage])
      setAgentInputMessage('')
      
      // Refresh messages to ensure sync
      setTimeout(() => {
        fetchCustomerMessages(selectedCustomer.id)
      }, 500)
    } catch (error) {
      console.error('Failed to send message:', error)
      alert('Failed to send message. Please try again.')
    } finally {
      setIsSending(false)
    }
  }

  // Auto-scroll when messages change
  useEffect(() => {
    agentMessagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Auto-focus input when customer is selected
  useEffect(() => {
    if (selectedCustomer) {
      setTimeout(() => {
        agentInputRef.current?.focus()
      }, 100)
    }
  }, [selectedCustomer])

  const getPriorityBadge = (score) => {
    if (score >= 60) return { level: '🔥 CRITICAL', color: '#dc2626', bgColor: '#fef2f2' }
    if (score >= 40) return { level: '⚡ HIGH', color: '#ea580c', bgColor: '#fff7ed' }
    if (score >= 20) return { level: '⭐ MEDIUM', color: '#f59e0b', bgColor: '#fffbeb' }
    return { level: '✓ LOW', color: '#10b981', bgColor: '#f0fdf4' }
  }

  const getStatusBadge = (status) => {
    const statusMap = {
      'new': { label: '🆕 New', color: '#3b82f6', bgColor: '#eff6ff' },
      'contacted': { label: '📞 Contacted', color: '#8b5cf6', bgColor: '#f3e8ff' },
      'in_progress': { label: '⏳ In Progress', color: '#f59e0b', bgColor: '#fffbeb' },
      'closed': { label: '✅ Closed', color: '#10b981', bgColor: '#f0fdf4' }
    }
    return statusMap[status] || statusMap['new']
  }

  return (
    <div className="agent-app-container">
      <div className="agent-page-container">
        {/* Agent Header */}
        <div className="agent-page-header">
          <div className="agent-header-content">
            <div className="agent-header-left">
              <span className="agent-header-emoji">👨‍💼</span>
              <div className="agent-header-info">
                <h1>Customer Support Agent Dashboard</h1>
                <p>DASA Hospitality - Queue-Based Support</p>
              </div>
            </div>
            <div className="agent-header-right">
              <span className="connection-status connected">
                🟢 {queue.length} {queue.length === 1 ? 'Customer' : 'Customers'} in Queue
              </span>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="agent-main-content">
          {/* Queue Sidebar */}
          <div className="agent-queue-sidebar">
            <div className="queue-header">
              <h2>Customer Queue</h2>
              <span className="queue-count">{queue.length}</span>
            </div>
            <div className="queue-list">
              {queue.length === 0 ? (
                <div className="queue-empty">
                  <div className="empty-icon">📭</div>
                  <p>No customers in queue</p>
                  <span>Waiting for new customers...</span>
                </div>
              ) : (
                queue.map((customer) => {
                  const priorityInfo = getPriorityBadge(customer.priority_score || 0)
                  const statusInfo = getStatusBadge(customer.status)
                  const isSelected = selectedCustomer?.id === customer.id

                  return (
                    <div
                      key={customer.id}
                      className={`queue-item ${isSelected ? 'selected' : ''} ${customer.agent_requested ? 'agent-requested' : ''}`}
                      onClick={() => handleSelectCustomer(customer)}
                    >
                      <div className="queue-item-header">
                        <div className="queue-item-name">{customer.name}</div>
                        {customer.agent_requested && (
                          <span className="agent-requested-badge">🚨</span>
                        )}
                      </div>
                      <div className="queue-item-details">
                        <span className="queue-item-contact">{customer.contact}</span>
                        <span className="queue-item-source">📍 {customer.source}</span>
                      </div>
                      <div className="queue-item-footer">
                        <span className="queue-item-priority" style={{
                          backgroundColor: priorityInfo.bgColor,
                          color: priorityInfo.color
                        }}>
                          {priorityInfo.level}
                        </span>
                        <span className="queue-item-status" style={{
                          backgroundColor: statusInfo.bgColor,
                          color: statusInfo.color
                        }}>
                          {statusInfo.label}
                        </span>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>

          {/* Chat Area */}
          <div className="agent-chat-area">
            {selectedCustomer ? (
              <>
                {/* Customer Info Bar */}
                <div className="customer-info-bar">
                  <div className="customer-info-main">
                    <div className="customer-info-left">
                      <span className="customer-avatar">👤</span>
                      <div>
                        <h3>{selectedCustomer.name}</h3>
                        <p>{selectedCustomer.contact} • {selectedCustomer.source}</p>
                      </div>
                    </div>
                    <div className="customer-info-right">
                      <button
                        className="status-button"
                        onClick={() => {
                          const newStatus = selectedCustomer.status === 'in_progress' ? 'contacted' : 'in_progress'
                          updateCustomerStatus(selectedCustomer.id, newStatus)
                        }}
                      >
                        {selectedCustomer.status === 'in_progress' ? 'Mark as Contacted' : 'Mark in Progress'}
                      </button>
                      <button
                        className="close-button"
                        onClick={() => {
                          updateCustomerStatus(selectedCustomer.id, 'closed')
                          setSelectedCustomer(null)
                        }}
                      >
                        Close Chat
                      </button>
                    </div>
                  </div>
                </div>

                {/* Chat Messages */}
                <div className="agent-chat-box">
                  <div className="agent-chat-messages">
                    {messages.length === 0 ? (
                      <div className="agent-waiting-state">
                        <div className="waiting-icon">💬</div>
                        <h2>No messages yet</h2>
                        <p>Start the conversation with {selectedCustomer.name}</p>
                      </div>
                    ) : (
                      messages.map((message) => (
                        <div key={message.id} className={`agent-message ${message.sender}`}>
                          <div className="agent-message-content">
                            <div className="agent-message-header">
                              <span className="agent-message-sender">
                                {message.sender === 'customer' || message.sender === 'user' ? '👤 Customer' : '👨‍💼 You (Agent)'}
                              </span>
                              <span className="agent-message-time">{message.timestamp}</span>
                            </div>
                            <div className="agent-message-text">{message.text}</div>
                          </div>
                        </div>
                      ))
                    )}
                    <div ref={agentMessagesEndRef} />
                  </div>

                  {/* Chat Input */}
                  <div className="agent-chat-input-area">
                    <form className="agent-chat-form" onSubmit={handleAgentSendMessage}>
                      <div className="agent-input-container">
                        <textarea
                          ref={agentInputRef}
                          value={agentInputMessage}
                          onChange={(e) => setAgentInputMessage(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault()
                              handleAgentSendMessage(e)
                            }
                          }}
                          placeholder="Type your reply to the customer..."
                          className="agent-message-input"
                          disabled={isSending}
                          rows="3"
                        />
                        <button
                          type="submit"
                          className="agent-send-button"
                          disabled={!agentInputMessage.trim() || isSending}
                        >
                          {isSending ? (
                            <span>Sending...</span>
                          ) : (
                            <>
                              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                <path d="M2.01 21L23 12L2.01 3L2 10L17 12L2 14L2.01 21Z" fill="currentColor"/>
                              </svg>
                              <span>Send</span>
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </>
            ) : (
              <div className="agent-chat-box empty-chat">
                <div className="agent-waiting-state">
                  <div className="waiting-animation">
                    <div className="waiting-icon">👋</div>
                    <div className="waiting-dots">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                  <h2>Select a Customer</h2>
                  <p>Choose a customer from the queue to start chatting</p>
                  <div className="waiting-instructions">
                    <h3>How it works:</h3>
                    <ol>
                      <li>Customers appear in the queue when they request support</li>
                      <li>Click on a customer to view their chat history</li>
                      <li>Reply to customers directly from this dashboard</li>
                      <li>Update customer status as you work with them</li>
                    </ol>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Agent Footer */}
        <div className="agent-page-footer">
          <p>© 2025 DASA Hospitality - Agent Support Dashboard</p>
        </div>
      </div>
    </div>
  )
}

export default Agent
