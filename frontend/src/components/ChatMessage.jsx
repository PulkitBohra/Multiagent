import React from 'react';
import ReactMarkdown from 'react-markdown';
import { FaUser, FaRobot } from 'react-icons/fa';

const ChatMessage = ({ message }) => {
  return (
    <div className={`message ${message.sender}`}>
      <div className="message-icon">
        {message.sender === 'user' ? <FaUser /> : <FaRobot />}
      </div>
      <div className="message-content">
        <ReactMarkdown>{message.content}</ReactMarkdown>
      </div>
    </div>
  );
};

export default ChatMessage;