import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import axios from 'axios'
import './Agent.css'

const API_BASE_URL = 'http://localhost:8001'

// Memoized queue item component for better performance
const QueueItem = React.memo(({ customer, isSelected, onSelect, getPriorityBadge, getStatusBadge }) => {
  const priorityInfo = getPriorityBadge(customer.priority_score || 0)
  const statusInfo = getStatusBadge(customer.status)

  return (
    <div
      className={`queue-item ${isSelected ? 'selected' : ''}`}
      onClick={() => onSelect(customer)}
    >
      <div className="queue-item-header">
        <div className="queue-item-name">{customer.name}</div>
      </div>
      <div className="queue-item-details">
        <span className="queue-item-contact">{customer.contact}</span>
        <span className="queue-item-source">{customer.source}</span>
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

// Memoized message component
const MessageItem = React.memo(({ message }) => {
  return (
    <div className={`agent-message ${message.sender}`}>
      <div className="agent-message-content">
        <div className="agent-message-header">
          <span className="agent-message-sender">
            {message.sender === 'customer' || message.sender === 'user' ? '👤 Customer' : '👨‍💼 You'}
          </span>
          <span className="agent-message-time">{message.timestamp}</span>
        </div>
        <div className="agent-message-text">{message.text}</div>
      </div>
    </div>
  )
})

function Agent() {
  const [queue, setQueue] = useState([])
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [messages, setMessages] = useState([])
  const [agentInputMessage, setAgentInputMessage] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [isLoadingQueue, setIsLoadingQueue] = useState(false)
  const agentMessagesEndRef = useRef(null)
  const agentInputRef = useRef(null)
  const lastMessageCountRef = useRef(0)

  // Memoized functions
  const getPriorityBadge = useCallback((score) => {
    if (score >= 60) return { level: 'CRITICAL', color: '#dc2626', bgColor: '#fee2e2' }
    if (score >= 40) return { level: 'HIGH', color: '#ea580c', bgColor: '#ffedd5' }
    if (score >= 20) return { level: 'MEDIUM', color: '#f59e0b', bgColor: '#fef3c7' }
    return { level: 'LOW', color: '#10b981', bgColor: '#d1fae5' }
  }, [])

  const getStatusBadge = useCallback((status) => {
    const statusMap = {
      'new': { label: 'New', color: '#3b82f6', bgColor: '#dbeafe' },
      'contacted': { label: 'Contacted', color: '#8b5cf6', bgColor: '#ede9fe' },
      'in_progress': { label: 'In Progress', color: '#f59e0b', bgColor: '#fef3c7' },
      'closed': { label: 'Closed', color: '#10b981', bgColor: '#d1fae5' }
    }
    return statusMap[status] || statusMap['new']
  }, [])

  // Optimized queue fetching with loading state
  const fetchQueue = useCallback(async () => {
    try {
      setIsLoadingQueue(true)
      const response = await axios.get(`${API_BASE_URL}/api/agent/queue`)
      if (response.data.success) {
        setQueue(response.data.queue || [])
      }
    } catch (error) {
      console.error('Failed to fetch queue:', error)
    } finally {
      setIsLoadingQueue(false)
    }
  }, [])

  // Fetch queue periodically - reduced frequency
  useEffect(() => {
    fetchQueue()
    const interval = setInterval(fetchQueue, 8000) // Reduced to 8 seconds
    return () => clearInterval(interval)
  }, [fetchQueue])

  // Fetch messages when customer is selected
  const fetchCustomerMessages = useCallback(async (customerId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/customers/${customerId}/messages`)
      if (response.data.success) {
        const formattedMessages = response.data.messages.map(msg => ({
          id: msg.id,
          text: msg.text,
          sender: msg.sender === 'user' ? 'customer' : msg.sender,
          timestamp: new Date(msg.timestamp).toLocaleTimeString()
        }))
        
        // Only update if messages actually changed
        if (formattedMessages.length !== lastMessageCountRef.current) {
          setMessages(formattedMessages)
          lastMessageCountRef.current = formattedMessages.length
        }
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error)
    }
  }, [])

  useEffect(() => {
    if (selectedCustomer) {
      fetchCustomerMessages(selectedCustomer.id)
      lastMessageCountRef.current = 0
      if (selectedCustomer.status === 'new') {
        updateCustomerStatus(selectedCustomer.id, 'in_progress')
      }
    } else {
      setMessages([])
      lastMessageCountRef.current = 0
    }
  }, [selectedCustomer, fetchCustomerMessages])

  // Poll for new messages - reduced frequency and smarter polling
  useEffect(() => {
    if (!selectedCustomer) return

    const interval = setInterval(() => {
      fetchCustomerMessages(selectedCustomer.id)
    }, 5000) // Increased to 5 seconds

    return () => clearInterval(interval)
  }, [selectedCustomer, fetchCustomerMessages])

  const updateCustomerStatus = useCallback(async (customerId, status) => {
    try {
      await axios.put(`${API_BASE_URL}/api/customers/${customerId}/status`, null, {
        params: { status }
      })
      fetchQueue() // Refresh queue
    } catch (error) {
      console.error('Failed to update status:', error)
    }
  }, [fetchQueue])

  const handleSelectCustomer = useCallback((customer) => {
    setSelectedCustomer(customer)
    setAgentInputMessage('')
  }, [])

  const handleAgentSendMessage = useCallback(async (e) => {
    e.preventDefault()
    if (!agentInputMessage.trim() || !selectedCustomer || isSending) return

    setIsSending(true)
    const messageText = agentInputMessage.trim()

    try {
      await axios.post(`${API_BASE_URL}/api/agent/send-message`, null, {
        params: {
          customer_id: selectedCustomer.id,
          message: messageText
        }
      })

      // Add message optimistically
      const agentMessage = {
        id: Date.now(),
        text: messageText,
        sender: 'agent',
        timestamp: new Date().toLocaleTimeString()
      }
      setMessages(prev => [...prev, agentMessage])
      setAgentInputMessage('')
      
      // Refresh after a delay
      setTimeout(() => {
        fetchCustomerMessages(selectedCustomer.id)
      }, 300)
    } catch (error) {
      console.error('Failed to send message:', error)
      alert('Failed to send message. Please try again.')
    } finally {
      setIsSending(false)
    }
  }, [agentInputMessage, selectedCustomer, isSending, fetchCustomerMessages])

  // Auto-scroll when messages change
  useEffect(() => {
    if (messages.length > 0) {
      agentMessagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages.length])

  // Auto-focus input when customer is selected
  useEffect(() => {
    if (selectedCustomer) {
      setTimeout(() => {
        agentInputRef.current?.focus()
      }, 100)
    }
  }, [selectedCustomer])

  // Memoized queue items
  const queueItems = useMemo(() => {
    return queue.map((customer) => (
      <QueueItem
        key={customer.id}
        customer={customer}
        isSelected={selectedCustomer?.id === customer.id}
        onSelect={handleSelectCustomer}
        getPriorityBadge={getPriorityBadge}
        getStatusBadge={getStatusBadge}
      />
    ))
  }, [queue, selectedCustomer, handleSelectCustomer, getPriorityBadge, getStatusBadge])

  // Memoized message items
  const messageItems = useMemo(() => {
    return messages.map((message) => (
      <MessageItem key={message.id} message={message} />
    ))
  }, [messages])

  return (
    <div className="agent-app-container">
      <div className="agent-page-container">
        {/* Agent Header */}
        <div className="agent-page-header">
          <div className="agent-header-content">
            <div className="agent-header-left">
              <div className="agent-header-info">
                <h1>Agent Dashboard</h1>
                <p>DASA Hospitality</p>
              </div>
            </div>
            <div className="agent-header-right">
              <span className="connection-status">
                {queue.length} {queue.length === 1 ? 'Customer' : 'Customers'}
              </span>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="agent-main-content">
          {/* Queue Sidebar */}
          <div className="agent-queue-sidebar">
            <div className="queue-header">
              <h2>Active Queue</h2>
              <span className="queue-count">{queue.length}</span>
            </div>
            <div className="queue-list">
              {isLoadingQueue ? (
                <div className="queue-empty">
                  <div className="empty-icon">⏳</div>
                  <p>Loading...</p>
                </div>
              ) : queue.length === 0 ? (
                <div className="queue-empty">
                  <div className="empty-icon">📭</div>
                  <p>No customers waiting</p>
                  <span>Customers who request an agent will appear here</span>
                </div>
              ) : (
                queueItems
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
                        {selectedCustomer.status === 'in_progress' ? 'Mark Contacted' : 'Mark Progress'}
                      </button>
                      <button
                        className="close-button"
                        onClick={() => {
                          updateCustomerStatus(selectedCustomer.id, 'closed')
                          setSelectedCustomer(null)
                        }}
                      >
                        Close
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
                      messageItems
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
                          placeholder="Type your reply..."
                          className="agent-message-input"
                          disabled={isSending}
                          rows="2"
                        />
                        <button
                          type="submit"
                          className="agent-send-button"
                          disabled={!agentInputMessage.trim() || isSending}
                        >
                          {isSending ? 'Sending...' : 'Send'}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </>
            ) : (
              <div className="agent-chat-box empty-chat">
                <div className="agent-waiting-state">
                  <div className="waiting-icon">👋</div>
                  <h2>Select a Customer</h2>
                  <p>Choose a customer from the queue to start chatting</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Agent Footer */}
        <div className="agent-page-footer">
          <p>© 2025 DASA Hospitality</p>
        </div>
      </div>
    </div>
  )
}

export default Agent
