import React from 'react';
import './styles/App.css';
import AgentInterface from './components/AgentInterface';
import { AgentProvider } from './context/AgentContext';

function App() {
  return (
    <div className="App">
      <AgentProvider>
        <AgentInterface />
      </AgentProvider>
    </div>
  );
}

export default App;