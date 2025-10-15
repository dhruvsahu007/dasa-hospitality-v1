import React, { useState, useEffect, useRef } from 'react'
import './Agent.css'

function Agent() {
  const [sharedMessages, setSharedMessages] = useState([])
  const [agentInputMessage, setAgentInputMessage] = useState('')
  const [isConnected, setIsConnected] = useState(false)
  const [customerInfo, setCustomerInfo] = useState(null)
  const agentMessagesEndRef = useRef(null)
  const agentInputRef = useRef(null)

  // Listen for messages from localStorage (simulated real-time communication)
  useEffect(() => {
    const checkMessages = () => {
      const messages = localStorage.getItem('customerMessages')
      if (messages) {
        const parsedMessages = JSON.parse(messages)
        setSharedMessages(parsedMessages)
        if (parsedMessages.length > 0) {
          setIsConnected(true)
        }
      }
      
      // Check for customer info
      const info = localStorage.getItem('customerInfo')
      if (info) {
        setCustomerInfo(JSON.parse(info))
      }
    }

    // Check every 500ms for new messages
    const interval = setInterval(checkMessages, 500)
    checkMessages() // Initial check

    return () => clearInterval(interval)
  }, [])

  // Auto-scroll when messages change
  useEffect(() => {
    agentMessagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [sharedMessages])

  // Auto-focus input when connected
  useEffect(() => {
    if (isConnected) {
      agentInputRef.current?.focus()
    }
  }, [isConnected])

  const handleAgentSendMessage = (e) => {
    e.preventDefault()
    if (agentInputMessage.trim() && isConnected) {
      const agentMessage = {
        id: Date.now(),
        text: agentInputMessage,
        sender: 'agent',
        timestamp: new Date().toLocaleTimeString()
      }
      
      // Add to shared messages
      const updatedMessages = [...sharedMessages, agentMessage]
      setSharedMessages(updatedMessages)
      
      // Save to localStorage for customer to see
      localStorage.setItem('customerMessages', JSON.stringify(updatedMessages))
      localStorage.setItem('agentReplied', Date.now().toString())
      
      setAgentInputMessage('')
    }
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
                <p>DASA Hospitality - Demo Mode</p>
              </div>
            </div>
            <div className="agent-header-right">
              <span className={`connection-status ${isConnected ? 'connected' : 'waiting'}`}>
                {isConnected ? '🟢 Customer Connected' : '⏳ Waiting for Customer'}
              </span>
            </div>
          </div>
          
          {/* Customer Info Panel */}
          {customerInfo && (
            <div className="customer-info-panel">
              <div className="info-header">
                <span className="info-icon">👤</span>
                <h3>Customer Information</h3>
              </div>
              <div className="info-grid">
                <div className="info-item">
                  <span className="info-label">Name:</span>
                  <span className="info-value">{customerInfo.name}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Contact:</span>
                  <span className="info-value">{customerInfo.contact}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Source:</span>
                  <span className="info-value">{customerInfo.source}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Agent Chat Area */}
        <div className="agent-chat-area">
          <div className="agent-chat-box">
            {/* Chat Messages */}
            <div className="agent-chat-messages">
              {sharedMessages.length === 0 ? (
                <div className="agent-waiting-state">
                  <div className="waiting-animation">
                    <div className="waiting-icon">⏳</div>
                    <div className="waiting-dots">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                  <h2>Waiting for Customer Connection</h2>
                  <p>Customer messages will appear here when they request support.</p>
                  <div className="waiting-instructions">
                    <h3>How to test:</h3>
                    <ol>
                      <li>Open the main website in another tab/window</li>
                      <li>Click the customer chat button (👤)</li>
                      <li>Type "I need an agent" or "connect me to support"</li>
                      <li>Customer messages will appear here instantly</li>
                      <li>Reply to the customer from this dashboard</li>
                    </ol>
                  </div>
                </div>
              ) : (
                sharedMessages.map((message) => (
                  <div key={message.id} className={`agent-message ${message.sender}`}>
                    <div className="agent-message-content">
                      <div className="agent-message-header">
                        <span className="agent-message-sender">
                          {message.sender === 'customer' ? '👤 Customer' : '👨‍💼 You (Agent)'}
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
                    placeholder={isConnected ? "Type your reply to the customer..." : "Waiting for customer to connect..."}
                    className="agent-message-input"
                    disabled={!isConnected}
                    rows="3"
                  />
                  <button 
                    type="submit" 
                    className="agent-send-button"
                    disabled={!agentInputMessage.trim() || !isConnected}
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path d="M2.01 21L23 12L2.01 3L2 10L17 12L2 14L2.01 21Z" fill="currentColor"/>
                    </svg>
                    <span>Send</span>
                  </button>
                </div>
              </form>
            </div>
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
