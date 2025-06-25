import React, { useState, useRef, useEffect } from 'react';
import { useAgent } from '../context/AgentContext';
import ChatMessage from './ChatMessage';
import { FaPaperPlane, FaTrash } from 'react-icons/fa';

const AgentInterface = () => {
  const { messages, loading, sendQuery, clearConversation } = useAgent();
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputValue.trim() && !loading) {
      sendQuery(inputValue);
      setInputValue('');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      handleSubmit(e);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const samplePrompts = [
    "What classes are available this week?",
    "Has order #12345 been paid?",
    "Create an order for Yoga Beginner for client Priya Sharma",
    "Show me clients with email priya.sharma@example.com",
    "What payments are pending?",
    "Create a new client named Alex Johnson, email alex@example.com, phone +1555123456"
  ];

  return (
    <div className="agent-interface">
      <div className="chat-header">
        <h2>Support Agent</h2>
        <button onClick={clearConversation} className="clear-btn">
          <FaTrash /> Clear
        </button>
      </div>
      
      <div className="chat-messages">
        {messages.length === 0 ? (
          <div className="welcome-message">
            <h3>Welcome to the Support Agent</h3>
            <p>How can I help you today? Try one of these sample prompts:</p>
            <ul className="sample-prompts">
              {samplePrompts.map((prompt, index) => (
                <li key={index} onClick={() => setInputValue(prompt)}>
                  {prompt}
                </li>
              ))}
            </ul>
          </div>
        ) : (
          messages.map((message, index) => (
            <ChatMessage key={index} message={message} />
          ))
        )}
        <div ref={messagesEndRef} />
        {loading && (
          <div className="message agent">
            <div className="message-icon">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <form onSubmit={handleSubmit} className="chat-input">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your message here..."
          disabled={loading}
        />
        <button type="submit" disabled={!inputValue.trim() || loading}>
          <FaPaperPlane />
        </button>
      </form>
    </div>
  );
};

export default AgentInterface;