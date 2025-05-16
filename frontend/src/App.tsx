import React from 'react';
import ChatInterface from './components/ChatInterface';
import './App.css';

const App: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4">
      <div className="w-full max-w-2xl">
        <header className="mb-6 text-center">
          <h1 className="text-4xl font-bold text-emerald-400">
            Corki 🍷
          </h1>
          <p className="text-gray-400">
            Ask me about wine, or upload a menu!
          </p>
        </header>
        <ChatInterface />
      </div>
    </div>
  );
}

export default App;