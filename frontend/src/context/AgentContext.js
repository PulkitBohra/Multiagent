import { createContext, useContext, useState } from 'react';
import axios from 'axios';

const AgentContext = createContext();

export const AgentProvider = ({ children }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const sendQuery = async (query) => {
    setLoading(true);
    
    
    setMessages(prev => [...prev, { sender: 'user', content: query }]);
    
    try {
      const response = await axios.post('/api/agent/query', { query });
      setMessages(prev => [...prev, { sender: 'agent', content: response.data.response }]);
    } catch (error) {
      setMessages(prev => [...prev, { 
        sender: 'agent', 
        content: 'Sorry, I encountered an error processing your request.' 
      }]);
    } finally {
      setLoading(false);
    }
  };

  const clearConversation = () => {
    setMessages([]);
  };

  return (
    <AgentContext.Provider value={{ messages, loading, sendQuery, clearConversation }}>
      {children}
    </AgentContext.Provider>
  );
};

export const useAgent = () => useContext(AgentContext);