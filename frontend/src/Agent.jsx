import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import axios from 'axios'
import './Agent.css'

const API_BASE_URL = 'http://localhost:5005'

// Memoized Queue Item Component
const QueueItem = React.memo(({ customer, isSelected, onClick, priorityScore, status }) => {
  const getPriorityColor = (score) => {
    if (score >= 60) return '#ef4444'
    if (score >= 40) return '#f97316'
    if (score >= 20) return '#eab308'
    return '#22c55e'
  }

  const getStatusColor = (status) => {
    const colors = {
      'new': '#3b82f6',
      'in_progress': '#f59e0b',
      'contacted': '#8b5cf6',
      'closed': '#10b981'
    }
    return colors[status] || '#6b7280'
  }

  return (
    <div
      className={`queue-item ${isSelected ? 'selected' : ''}`}
      onClick={onClick}
    >
      <div className="queue-item-top">
        <div className="queue-item-name">{customer.name}</div>
        <div className="priority-indicator" style={{ backgroundColor: getPriorityColor(priorityScore) }} />
      </div>
      <div className="queue-item-contact">{customer.contact}</div>
      <div className="queue-item-meta">
        <span className="queue-item-source">{customer.source}</span>
        <span className="queue-item-status" style={{ color: getStatusColor(status) }}>
          {status === 'in_progress' ? 'In Progress' : status === 'new' ? 'New' : status}
        </span>
      </div>
    </div>
  )
})

// Memoized Message Component
const MessageBubble = React.memo(({ message }) => {
  const isAgent = message.sender === 'agent'
  
  return (
    <div className={`message-bubble ${isAgent ? 'agent' : 'customer'}`}>
      <div className="message-text">{message.text}</div>
      <div className="message-time">{message.timestamp}</div>
    </div>
  )
})

function Agent() {
  const [queue, setQueue] = useState([])
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [messages, setMessages] = useState([])
  const [inputMessage, setInputMessage] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)
  const lastMessageIdRef = useRef(0)

  // Fetch queue
  const fetchQueue = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/agent/queue`)
      if (response.data.success) {
        setQueue(response.data.queue || [])
      }
    } catch (error) {
      console.error('Failed to fetch queue:', error)
    }
  }, [])

  // Fetch messages for selected customer
  const fetchMessages = useCallback(async (customerId) => {
    if (!customerId) return
    
    try {
      const response = await axios.get(`${API_BASE_URL}/api/customers/${customerId}/messages`)
      if (response.data.success) {
        const formatted = response.data.messages.map(msg => ({
          id: msg.id,
          text: msg.text,
          sender: msg.sender === 'user' ? 'customer' : msg.sender,
          timestamp: new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }))
        
        // Only update if there are new messages
        const lastId = formatted.length > 0 ? formatted[formatted.length - 1].id : 0
        if (lastId !== lastMessageIdRef.current) {
          setMessages(formatted)
          lastMessageIdRef.current = lastId
        }
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error)
    }
  }, [])

  // Update customer status
  const updateStatus = useCallback(async (customerId, status) => {
    try {
      await axios.put(`${API_BASE_URL}/api/customers/${customerId}/status`, null, {
        params: { status }
      })
      fetchQueue()
      if (selectedCustomer?.id === customerId) {
        setSelectedCustomer(prev => ({ ...prev, status }))
      }
    } catch (error) {
      console.error('Failed to update status:', error)
    }
  }, [fetchQueue, selectedCustomer])

  // Select customer
  const handleSelectCustomer = useCallback((customer) => {
    setSelectedCustomer(customer)
    setInputMessage('')
    setMessages([])
    lastMessageIdRef.current = 0
    
    // Mark as in_progress if new
    if (customer.status === 'new') {
      updateStatus(customer.id, 'in_progress')
    }
  }, [updateStatus])

  // Send message
  const handleSend = useCallback(async (e) => {
    e.preventDefault()
    if (!inputMessage.trim() || !selectedCustomer || isSending) return

    setIsSending(true)
    const text = inputMessage.trim()

    try {
      await axios.post(`${API_BASE_URL}/api/agent/send-message`, null, {
        params: {
          customer_id: selectedCustomer.id,
          message: text
        }
      })

      // Add optimistically
      const newMessage = {
        id: Date.now(),
        text,
        sender: 'agent',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
      setMessages(prev => [...prev, newMessage])
      setInputMessage('')
      
      // Refresh after delay
      setTimeout(() => fetchMessages(selectedCustomer.id), 500)
    } catch (error) {
      console.error('Failed to send:', error)
      alert('Failed to send message')
    } finally {
      setIsSending(false)
    }
  }, [inputMessage, selectedCustomer, isSending, fetchMessages])

  // Effects
  useEffect(() => {
    fetchQueue()
    const interval = setInterval(fetchQueue, 10000) // 10 seconds
    return () => clearInterval(interval)
  }, [fetchQueue])

  useEffect(() => {
    if (selectedCustomer) {
      fetchMessages(selectedCustomer.id)
      const interval = setInterval(() => fetchMessages(selectedCustomer.id), 5000)
      return () => clearInterval(interval)
    }
  }, [selectedCustomer, fetchMessages])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (selectedCustomer) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [selectedCustomer])

  // Memoized queue items
  const queueItems = useMemo(() => {
    return queue.map(customer => (
      <QueueItem
        key={customer.id}
        customer={customer}
        isSelected={selectedCustomer?.id === customer.id}
        onClick={() => handleSelectCustomer(customer)}
        priorityScore={customer.priority_score || 0}
        status={customer.status}
      />
    ))
  }, [queue, selectedCustomer, handleSelectCustomer])

  // Memoized message items
  const messageItems = useMemo(() => {
    return messages.map(msg => (
      <MessageBubble key={msg.id} message={msg} />
    ))
  }, [messages])

  return (
    <div className="agent-dashboard">
      {/* Header */}
      <header className="agent-header">
        <div className="agent-header-content">
          <div>
            <h1>Agent Dashboard</h1>
            <p>DASA Hospitality</p>
          </div>
          <div className="queue-badge">
            {queue.length} {queue.length === 1 ? 'customer' : 'customers'}
          </div>
        </div>
      </header>

      {/* Main Layout */}
      <div className="agent-layout">
        {/* Queue Sidebar */}
        <aside className="queue-sidebar">
          <div className="queue-header">
            <h2>Active Queue</h2>
            <span className="queue-count-badge">{queue.length}</span>
          </div>
          
          <div className="queue-list">
            {queue.length === 0 ? (
              <div className="empty-queue">
                <div className="empty-icon">💬</div>
                <p>No active customers</p>
                <span>Waiting for agent requests...</span>
              </div>
            ) : (
              queueItems
            )}
          </div>
        </aside>

        {/* Chat Area */}
        <main className="chat-area">
          {selectedCustomer ? (
            <>
              {/* Customer Header */}
              <div className="chat-header">
                <div className="customer-header-info">
                  <div className="customer-avatar-small">{selectedCustomer.name.charAt(0).toUpperCase()}</div>
                  <div>
                    <h3>{selectedCustomer.name}</h3>
                    <p>{selectedCustomer.contact} · {selectedCustomer.source}</p>
                  </div>
                </div>
                <div className="chat-actions">
                  <button
                    className="action-btn secondary"
                    onClick={() => {
                      const newStatus = selectedCustomer.status === 'in_progress' ? 'contacted' : 'in_progress'
                      updateStatus(selectedCustomer.id, newStatus)
                    }}
                  >
                    {selectedCustomer.status === 'in_progress' ? 'Mark Contacted' : 'Mark Progress'}
                  </button>
                  <button
                    className="action-btn danger"
                    onClick={() => {
                      updateStatus(selectedCustomer.id, 'closed')
                      setSelectedCustomer(null)
                    }}
                  >
                    Close
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div className="messages-container">
                {messages.length === 0 ? (
                  <div className="empty-messages">
                    <div className="empty-icon-large">💬</div>
                    <p>No messages yet</p>
                    <span>Start the conversation</span>
                  </div>
                ) : (
                  <div className="messages-list">
                    {messageItems}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>

              {/* Input */}
              <div className="chat-input-container">
                <form onSubmit={handleSend} className="chat-input-form">
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="chat-input"
                    disabled={isSending}
                  />
                  <button
                    type="submit"
                    className="send-btn"
                    disabled={!inputMessage.trim() || isSending}
                  >
                    {isSending ? 'Sending...' : 'Send'}
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="no-selection">
              <div className="no-selection-icon">👋</div>
              <h2>Select a Customer</h2>
              <p>Choose a customer from the queue to start chatting</p>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

export default Agent

