import React, { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import './App.css'

// API Configuration
const API_BASE_URL = 'http://localhost:5005'

// Inline Text Input Component
function InlineTextInput({ message, onSubmit, placeholder, type = 'text' }) {
  const [value, setValue] = useState('')
  const inputRef = useRef(null)
  
  useEffect(() => {
    inputRef.current?.focus()
  }, [])
  
  const handleSubmit = (e) => {
    e.preventDefault()
    if (value.trim()) {
      onSubmit(value, message.id)
      setValue('')
    }
  }
  
  return (
    <form className="inline-input-form" onSubmit={handleSubmit}>
      <input
        ref={inputRef}
        type={type}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="inline-text-input"
      />
      <button type="submit" className="inline-submit-btn">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M2.01 21L23 12L2.01 3L2 10L17 12L2 14L2.01 21Z" fill="currentColor"/>
        </svg>
      </button>
    </form>
  )
}

// Inline Dropdown Component
function InlineDropdown({ message, onSubmit, options }) {
  const [value, setValue] = useState('')
  const selectRef = useRef(null)
  
  useEffect(() => {
    selectRef.current?.focus()
  }, [])
  
  const handleChange = (e) => {
    const selectedValue = e.target.value
    if (selectedValue) {
      setValue(selectedValue)
      // Automatically submit when option is selected
      setTimeout(() => {
        onSubmit(selectedValue, message.id)
      }, 100)
    }
  }
  
  return (
    <div className="inline-dropdown-container">
      <select
        ref={selectRef}
        value={value}
        onChange={handleChange}
        className="inline-dropdown"
      >
        <option value="">Select an option...</option>
        {options.map((option, index) => (
          <option key={index} value={option}>
            {option}
          </option>
        ))}
      </select>
      <svg className="dropdown-arrow" width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path d="M7 10l5 5 5-5z" fill="currentColor"/>
      </svg>
    </div>
  )
}

// Multi-Field Form Component
function MultiFieldForm({ message, onSubmit }) {
  const [formData, setFormData] = useState({
    name: '',
    contact: '',
    source: ''
  })
  const nameRef = useRef(null)
  
  useEffect(() => {
    nameRef.current?.focus()
  }, [])
  
  const handleSubmit = (e) => {
    e.preventDefault()
    if (formData.name.trim() && formData.contact.trim() && formData.source) {
      onSubmit(formData, message.id)
    }
  }
  
  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }
  
  return (
    <form className="multi-field-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <label>Your Name</label>
        <input
          ref={nameRef}
          type="text"
          value={formData.name}
          onChange={(e) => handleChange('name', e.target.value)}
          placeholder="Enter your name..."
          className="form-input"
          required
        />
      </div>
      
      <div className="form-group">
        <label>Email / Mobile</label>
        <input
          type="text"
          value={formData.contact}
          onChange={(e) => handleChange('contact', e.target.value)}
          placeholder="Enter your email or mobile..."
          className="form-input"
          required
        />
      </div>
      
      <div className="form-group">
        <label>How did you hear about us?</label>
        <select
          value={formData.source}
          onChange={(e) => handleChange('source', e.target.value)}
          className="form-select"
          required
        >
          <option value="">Select an option...</option>
          <option value="Google Search">Google Search</option>
          <option value="Social Media">Social Media</option>
          <option value="Referral">Referral</option>
          <option value="Advertisement">Advertisement</option>
          <option value="Website">Website</option>
          <option value="Other">Other</option>
        </select>
      </div>
      
      <button type="submit" className="form-submit-btn">
        Submit
      </button>
    </form>
  )
}

function App() {
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [agentRequested, setAgentRequested] = useState(false)
  const [isAgentMode, setIsAgentMode] = useState(false) // When true, customer is chatting with agent
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    contact: '',
    source: '',
    completed: false
  })
  const [currentQuestion, setCurrentQuestion] = useState(0) // 0: name, 1: contact, 2: source, 3: completed
  const [customerId, setCustomerId] = useState(null)
  const [sessionId, setSessionId] = useState(null)
  const [sessionStartTime, setSessionStartTime] = useState(Date.now())
  const [messages, setMessages] = useState([])
  const [sharedMessages, setSharedMessages] = useState([]) // Shared between customer and agent
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [attachedFiles, setAttachedFiles] = useState([])
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)
  const fileInputRef = useRef(null)
  const processedAgentMessageIdsRef = useRef(new Set())

  // Detect device info
  const getDeviceInfo = () => {
    const ua = navigator.userAgent
    let device_type = 'Desktop'
    let browser = 'Unknown'
    let os = 'Unknown'
    
    // Detect device type
    if (/Mobile|Android|iPhone|iPad|iPod/i.test(ua)) {
      device_type = /iPad/i.test(ua) ? 'Tablet' : 'Mobile'
    }
    
    // Detect browser
    if (ua.indexOf('Chrome') > -1 && ua.indexOf('Edg') === -1) browser = 'Chrome'
    else if (ua.indexOf('Safari') > -1 && ua.indexOf('Chrome') === -1) browser = 'Safari'
    else if (ua.indexOf('Firefox') > -1) browser = 'Firefox'
    else if (ua.indexOf('Edg') > -1) browser = 'Edge'
    else if (ua.indexOf('MSIE') > -1 || ua.indexOf('Trident') > -1) browser = 'IE'
    
    // Detect OS
    if (ua.indexOf('Win') > -1) os = 'Windows'
    else if (ua.indexOf('Mac') > -1) os = 'macOS'
    else if (ua.indexOf('Linux') > -1) os = 'Linux'
    else if (ua.indexOf('Android') > -1) os = 'Android'
    else if (ua.indexOf('like Mac') > -1) os = 'iOS'
    
    return { device_type, browser, os }
  }

  // Auto-scroll to bottom when messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Listen for agent replies from localStorage
  useEffect(() => {
    const checkAgentReplies = () => {
      const agentReplied = localStorage.getItem('agentReplied')
      const storedMessages = localStorage.getItem('customerMessages')
      
      if (agentReplied && storedMessages && isAgentMode) {
        const parsedMessages = JSON.parse(storedMessages)
        setSharedMessages(parsedMessages)
        
        // Find new agent messages and add to customer view
        const agentMessages = parsedMessages.filter(msg => msg.sender === 'agent')
        agentMessages.forEach(agentMsg => {
          // Check if message already exists in messages
          const exists = messages.some(m => m.id === agentMsg.id && m.sender === 'bot')
          if (!exists) {
            const customerViewMessage = {
              id: agentMsg.id,
              text: agentMsg.text,
              sender: 'bot',
              timestamp: agentMsg.timestamp
            }
            setMessages(prev => [...prev, customerViewMessage])
          }
        })
      }
    }

    const interval = setInterval(checkAgentReplies, 500)
    return () => clearInterval(interval)
  }, [isAgentMode, messages])

  // Poll backend for agent messages when in agent mode and reflect them in customer chat
  useEffect(() => {
    if (!isAgentMode || !customerId) return

    const pollAgentMessages = async () => {
      try {
        const resp = await axios.get(`${API_BASE_URL}/api/customers/${customerId}/messages`)
        if (resp.data?.success && Array.isArray(resp.data.messages)) {
          const agentMsgs = resp.data.messages.filter(m => m.sender === 'agent')
          const newCustomerViewMessages = []
          agentMsgs.forEach(m => {
            if (!processedAgentMessageIdsRef.current.has(m.id)) {
              processedAgentMessageIdsRef.current.add(m.id)
              newCustomerViewMessages.push({
                id: `agent-${m.id}`,
                text: m.text,
                sender: 'bot',
                timestamp: new Date(m.timestamp).toLocaleTimeString()
              })
            }
          })
          if (newCustomerViewMessages.length > 0) {
            setMessages(prev => [...prev, ...newCustomerViewMessages])
          }
        }
      } catch (e) {
        // silent fail to avoid UX noise
      }
    }

    // Initial fetch
    pollAgentMessages()
    const interval = setInterval(pollAgentMessages, 2000)
    return () => clearInterval(interval)
  }, [isAgentMode, customerId])

  // Auto-focus input when chat opens or after bot responds
  useEffect(() => {
    if (isChatOpen && !isLoading) {
      inputRef.current?.focus()
    }
  }, [isChatOpen, isLoading, messages])

  // Initialize welcome flow when chat opens for the first time
  useEffect(() => {
    if (isChatOpen && messages.length === 0) {
      const welcomeMessage = {
        id: 1,
        text: "How can we help with DASA Hospitality Private Limited?",
        sender: 'bot',
        timestamp: new Date().toLocaleTimeString()
      }
      const infoFormMessage = {
        id: 2,
        text: "Before we start, please share a few details:",
        sender: 'bot',
        timestamp: new Date().toLocaleTimeString(),
        isQuestion: true,
        hasMultiForm: true
      }
      setMessages([welcomeMessage, infoFormMessage])
    }
  }, [isChatOpen])

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (inputMessage.trim() && !isLoading) {
      const userMessageText = inputMessage.trim()
      
      // Check if user is requesting an agent
      const agentKeywords = ['agent', 'human', 'support', 'representative', 'person', 'talk to someone', 'customer support', 'help desk']
      const requestsAgent = agentKeywords.some(keyword => userMessageText.toLowerCase().includes(keyword))
      
      const userMessage = {
        id: messages.length + 1,
        text: userMessageText,
        sender: 'user',
        timestamp: new Date().toLocaleTimeString(),
        attachments: attachedFiles.length > 0 ? [...attachedFiles] : undefined
      }
      
      setMessages(prev => [...prev, userMessage])
      setInputMessage('')
      setAttachedFiles([])
      
      // Save user message to backend
      saveChatMessageToBackend(userMessageText, 'user')
      
      // If agent requested, enable agent mode and notify
      if (requestsAgent && !agentRequested) {
        setAgentRequested(true)
        setIsAgentMode(true) // Switch to agent mode
        
        // Ensure customer info is saved first if not already saved
        if (!customerId || !sessionId) {
          if (customerInfo.completed) {
            await saveCustomerToBackend(customerInfo)
            // Wait a bit for the save to complete
            await new Promise(resolve => setTimeout(resolve, 500))
          }
        }
        
        // Mark agent as requested in the backend
        if (customerId && sessionId) {
          try {
            const response = await axios.post(`${API_BASE_URL}/api/customer/request-agent`, null, {
              params: {
                customer_id: customerId,
                session_id: sessionId
              }
            })
            console.log('✅ Agent request marked:', response.data)
          } catch (error) {
            console.error('❌ Failed to mark agent request:', error)
            // Try again with just customer_id (let backend find session)
            if (customerId) {
              try {
                await axios.post(`${API_BASE_URL}/api/customer/request-agent`, null, {
                  params: {
                    customer_id: customerId
                  }
                })
              } catch (retryError) {
                console.error('❌ Retry failed:', retryError)
              }
            }
          }
        } else {
          console.warn('⚠️ Cannot mark agent request: customerId or sessionId missing', { customerId, sessionId })
        }
        
        const agentNotification = {
          id: messages.length + 2,
          text: "Perfect! I'm connecting you with a customer support agent now. They'll be with you shortly!",
          sender: 'bot',
          timestamp: new Date().toLocaleTimeString()
        }
        setMessages(prev => [...prev, agentNotification])
        
        // Add customer message to shared chat via localStorage
        const sharedUserMessage = {
          id: Date.now(),
          text: userMessageText,
          sender: 'customer',
          timestamp: new Date().toLocaleTimeString()
        }
        setSharedMessages([sharedUserMessage])
        localStorage.setItem('customerMessages', JSON.stringify([sharedUserMessage]))
        return
      }
      
      // If in agent mode, send to shared chat via localStorage
      if (isAgentMode) {
        const customerMessage = {
          id: Date.now(),
          text: userMessageText,
          sender: 'customer',
          timestamp: new Date().toLocaleTimeString()
        }
        
        const updatedShared = [...sharedMessages, customerMessage]
        setSharedMessages(updatedShared)
        localStorage.setItem('customerMessages', JSON.stringify(updatedShared))
        
        // Message already added to main messages at line 301
        return
      }
      
      setIsLoading(true)
      
      // Add typing indicator
      const typingMessage = {
        id: messages.length + 2,
        text: "AI is thinking...",
        sender: 'bot',
        timestamp: new Date().toLocaleTimeString(),
        isTyping: true
      }
      setMessages(prev => [...prev, typingMessage])
      
      try {
        // Call AWS Bedrock API
        const response = await axios.post(`${API_BASE_URL}/api/chatbot/message`, {
          message: inputMessage
        })
        
        // Remove typing indicator and add real response
        setMessages(prev => {
          const withoutTyping = prev.filter(msg => !msg.isTyping)
          const botResponse = {
            id: withoutTyping.length + 1,
            text: response.data.response,
            sender: 'bot',
            timestamp: new Date().toLocaleTimeString(),
            metadata: {
              contextUsed: response.data.context_used,
              knowledgeBaseResults: response.data.knowledge_base_results,
              modelUsed: response.data.model_used
            }
          }
          // Save bot message to backend
          saveChatMessageToBackend(response.data.response, 'bot')
          return [...withoutTyping, botResponse]
        })
        
      } catch (error) {
        console.error('Error calling chatbot API:', error)
        
        // Remove typing indicator and add error message
        setMessages(prev => {
          const withoutTyping = prev.filter(msg => !msg.isTyping)
          const errorResponse = {
            id: withoutTyping.length + 1,
            text: "I apologize, but I'm having trouble connecting to our AI service right now. Please try again in a moment.",
            sender: 'bot',
            timestamp: new Date().toLocaleTimeString()
          }
          return [...withoutTyping, errorResponse]
        })
      } finally {
        setIsLoading(false)
      }
    }
  }

  // Handle emoji selection
  const handleEmojiSelect = (emoji) => {
    setInputMessage(prev => prev + emoji)
    setShowEmojiPicker(false)
    inputRef.current?.focus()
  }

  // Save customer info to backend
  const saveCustomerToBackend = async (customerData) => {
    try {
      const timeSpent = Math.floor((Date.now() - sessionStartTime) / 1000) // in seconds
      const deviceInfo = getDeviceInfo()
      
      const response = await axios.post(`${API_BASE_URL}/api/customer/save`, {
        name: customerData.name,
        contact: customerData.contact,
        source: customerData.source,
        device_info: deviceInfo,
        time_spent: timeSpent
      })
      
      if (response.data.success) {
        setCustomerId(response.data.customer_id)
        setSessionId(response.data.session_id)
        console.log('✅ Customer info saved:', response.data)
      }
    } catch (error) {
      console.error('❌ Failed to save customer info:', error)
    }
  }

  // Update time spent periodically
  useEffect(() => {
    if (customerId && isChatOpen) {
      const interval = setInterval(async () => {
        const timeSpent = Math.floor((Date.now() - sessionStartTime) / 1000)
        try {
          await axios.post(`${API_BASE_URL}/api/customer/update-time`, null, {
            params: { customer_id: customerId, time_spent: timeSpent }
          })
        } catch (error) {
          console.error('Failed to update time:', error)
        }
      }, 30000) // Update every 30 seconds
      
      return () => clearInterval(interval)
    }
  }, [customerId, isChatOpen, sessionStartTime])

  // Save chat messages to backend
  const saveChatMessageToBackend = async (message, sender) => {
    if (customerId && sessionId) {
      try {
        await axios.post(`${API_BASE_URL}/api/chat/save-message`, null, {
          params: {
            customer_id: customerId,
            session_id: sessionId,
            message: message,
            sender: sender
          }
        })
      } catch (error) {
        console.error('Failed to save chat message:', error)
      }
    }
  }

  // Handle inline form submission for customer info
  const handleMultiFormSubmit = (formData, questionId) => {
    // Remove the question message with multi-form
    setMessages(prev => prev.filter(msg => msg.id !== questionId))
    
    // Add user's response as a summary message
    const userResponse = {
      id: Date.now(),
      text: `✓ Name: ${formData.name}\n✓ Contact: ${formData.contact}\n✓ Source: ${formData.source}`,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString()
    }
    setMessages(prev => [...prev, userResponse])
    
    // Update customer info
    const updatedInfo = {
      name: formData.name,
      contact: formData.contact,
      source: formData.source,
      completed: true
    }
    setCustomerInfo(updatedInfo)
    localStorage.setItem('customerInfo', JSON.stringify(updatedInfo))
    
    // Save to backend database
    saveCustomerToBackend(updatedInfo)
    
    // Show completion message
    const completionMessage = {
      id: Date.now() + 1,
      text: "Thank you! I'm ready to assist you now. How can I help you today?",
      sender: 'bot',
      timestamp: new Date().toLocaleTimeString()
    }
    setMessages(prev => [...prev, completionMessage])
    setCurrentQuestion(3)
  }

  // Handle file selection
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files)
    if (files.length > 0) {
      const newFiles = files.map(file => ({
        file,
        name: file.name,
        size: file.size,
        type: file.type,
        id: Date.now() + Math.random()
      }))
      setAttachedFiles(prev => [...prev, ...newFiles])
      setShowEmojiPicker(false)
    }
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // Remove attached file
  const handleRemoveFile = (fileId) => {
    setAttachedFiles(prev => prev.filter(f => f.id !== fileId))
  }

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  // Common emojis for quick access
  const commonEmojis = [
    '😊', '😃', '👍', '❤️', '🎉', '🏨', '✨', '👋',
    '😎', '🤔', '💼', '📊', '💰', '🌟', '🔥', '👏',
    '😅', '🙌', '💯', '⭐', '📈', '🎯', '💡', '🤝'
  ]

  return (
    <div className="app-container">
      <img 
        src="/images/dasa-hos-v1.png" 
        alt="DASA Hospitality Homepage" 
        className="full-page-image"
      />
      
      {/* Chatbot Toggle Button */}
      <button 
        className="chatbot-toggle"
        onClick={() => setIsChatOpen(!isChatOpen)}
        title="Open AI Assistant"
      >
        <span className="chatbot-toggle-emoji">👤</span>
        <span className="chatbot-badge">AI</span>
      </button>

      {/* Agent Support Toggle Button - Only shows when agent is requested */}
      {agentRequested && (
        <a 
          href="/agent.html"
          target="_blank"
          rel="noopener noreferrer"
          className="agent-toggle"
          title="Open Agent Dashboard (New Window)"
        >
          <span className="agent-toggle-emoji">👨‍💼</span>
          <span className="agent-badge">Agent</span>
          <span className="agent-notification-dot"></span>
        </a>
      )}

      {/* Chatbot Overlay */}
      {isChatOpen && (
        <div className="chatbot-overlay">
          <div className="chatbot-container">
            {/* Chat Header */}
            <div className="chat-header">
              <div className="chat-header-info">
                <div className="chat-avatar">
                  <img 
                    src="/dasa-logo.png" 
                    alt="DASA Hospitality" 
                    className="chat-avatar-img"
                  />
                </div>
                <div className="chat-header-text">
                  <h3>{isAgentMode ? "Customer Support Agent" : "DASA Hospitality AI"}</h3>
                  {isAgentMode && <span className="agent-status-small">🟢 Connected to Agent</span>}
                </div>
              </div>
              <button 
                className="chat-close"
                onClick={() => setIsChatOpen(false)}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z" fill="currentColor"/>
                </svg>
              </button>
            </div>

            {/* Chat Messages */}
            <div className="chat-messages">
              {messages.map((message) => (
                <div key={message.id} className={`message ${message.sender} ${message.isQuestion ? 'question-message' : ''}`}>
                  <div className="message-content">
                    <div className="message-text">
                      {message.isQuestion && (
                        <svg className="back-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" fill="currentColor"/>
                        </svg>
                      )}
                      {message.text}
                      {message.isTyping && (
                        <span className="typing-indicator">
                          <span>.</span>
                          <span>.</span>
                          <span>.</span>
                        </span>
                      )}
                    </div>
                    
                    {/* Multi-Field Form for Customer Info */}
                    {message.hasMultiForm && (
                      <MultiFieldForm
                        message={message}
                        onSubmit={handleMultiFormSubmit}
                      />
                    )}
                    
                    {message.attachments && message.attachments.length > 0 && (
                      <div className="message-attachments">
                        {message.attachments.map(file => (
                          <div key={file.id} className="message-file">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                              <path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2ZM18 20H6V4H13V9H18V20Z" fill="currentColor"/>
                            </svg>
                            <span>{file.name}</span>
                            <span className="file-size-small">({formatFileSize(file.size)})</span>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="message-time">{message.timestamp}</div>
                    {message.metadata && (
                      <div className="message-metadata">
                        {message.metadata.contextUsed && (
                          <span className="metadata-tag">📚 Knowledge Base</span>
                        )}
                        {message.metadata.knowledgeBaseResults > 0 && (
                          <span className="metadata-tag">
                            {message.metadata.knowledgeBaseResults} sources
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Chat Input - Only show when customer info is completed */}
            <form className="chat-input" onSubmit={handleSendMessage} style={{ display: customerInfo.completed ? 'block' : 'none' }}>
              <div className="input-container">
                {/* Emoji Picker */}
                {showEmojiPicker && (
                  <div className="emoji-picker">
                    <div className="emoji-grid">
                      {commonEmojis.map((emoji, index) => (
                        <button
                          key={index}
                          type="button"
                          className="emoji-btn"
                          onClick={() => handleEmojiSelect(emoji)}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* File Attachments Display */}
                {attachedFiles.length > 0 && (
                  <div className="attached-files">
                    {attachedFiles.map(file => (
                      <div key={file.id} className="file-chip">
                        <div className="file-info">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="file-icon">
                            <path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2ZM18 20H6V4H13V9H18V20Z" fill="currentColor"/>
                          </svg>
                          <div className="file-details">
                            <span className="file-name">{file.name}</span>
                            <span className="file-size">{formatFileSize(file.size)}</span>
                          </div>
                        </div>
                        <button
                          type="button"
                          className="file-remove-btn"
                          onClick={() => handleRemoveFile(file.id)}
                          title="Remove file"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                            <path d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z" fill="currentColor"/>
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Input Row */}
                <div className="input-actions-row">
                  <div className="input-actions-left">
                    <button 
                      type="button"
                      className="input-action-btn"
                      title="Choose emoji"
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20ZM15.5 11C16.33 11 17 10.33 17 9.5C17 8.67 16.33 8 15.5 8C14.67 8 14 8.67 14 9.5C14 10.33 14.67 11 15.5 11ZM8.5 11C9.33 11 10 10.33 10 9.5C10 8.67 9.33 8 8.5 8C7.67 8 7 8.67 7 9.5C7 10.33 7.67 11 8.5 11ZM12 17.5C14.33 17.5 16.31 16.04 17.11 14H6.89C7.69 16.04 9.67 17.5 12 17.5Z" fill="currentColor"/>
                      </svg>
                    </button>
                    
                    <button 
                      type="button"
                      className="input-action-btn"
                      title="Attach file"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path d="M16.5 6V17.5C16.5 19.71 14.71 21.5 12.5 21.5C10.29 21.5 8.5 19.71 8.5 17.5V5C8.5 3.62 9.62 2.5 11 2.5C12.38 2.5 13.5 3.62 13.5 5V15.5C13.5 16.05 13.05 16.5 12.5 16.5C11.95 16.5 11.5 16.05 11.5 15.5V6H10V15.5C10 16.88 11.12 18 12.5 18C13.88 18 15 16.88 15 15.5V5C15 2.79 13.21 1 11 1C8.79 1 7 2.79 7 5V17.5C7 20.54 9.46 23 12.5 23C15.54 23 18 20.54 18 17.5V6H16.5Z" fill="currentColor"/>
                      </svg>
                    </button>
                    
                    {/* Hidden file input */}
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg,.gif,.xlsx,.xls,.csv"
                      onChange={handleFileSelect}
                      style={{ display: 'none' }}
                    />
                    
                    <button 
                      type="button"
                      className="input-action-btn"
                      title="Send voice message"
                      onClick={() => alert('Voice message coming soon!')}
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path d="M12 14C13.66 14 15 12.66 15 11V5C15 3.34 13.66 2 12 2C10.34 2 9 3.34 9 5V11C9 12.66 10.34 14 12 14ZM17.91 11C17.91 14.39 15.2 17.09 11.82 17.09C8.44 17.09 5.73 14.39 5.73 11H4C4 14.93 7.05 18.16 10.91 18.72V22H13.09V18.72C16.95 18.16 20 14.93 20 11H17.91Z" fill="currentColor"/>
                      </svg>
                    </button>
                  </div>

                  <textarea
                    ref={inputRef}
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        handleSendMessage(e)
                      }
                    }}
                    placeholder={
                      isLoading 
                        ? "AI is thinking..." 
                        : "Compose your message..."
                    }
                    className="message-input"
                    disabled={isLoading}
                    rows="1"
                  />
                  
                  <button 
                    type="submit" 
                    className={`send-button ${isLoading ? 'loading' : ''}`}
                    disabled={isLoading || !inputMessage.trim()}
                  >
                    {isLoading ? (
                      <div className="spinner-small"></div>
                    ) : (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path d="M2.01 21L23 12L2.01 3L2 10L17 12L2 14L2.01 21Z" fill="currentColor"/>
                      </svg>
                    )}
                  </button>
                </div>
              </div>
              
              {/* Notification Banner */}
              {customerInfo.completed && (
                <div className="notification-banner">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2zm-2 1H8v-6c0-2.48 1.51-4.5 4-4.5s4 2.02 4 4.5v6z" fill="currentColor"/>
                  </svg>
                  <span>Stay updated with email notifications for your queries</span>
                </div>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
