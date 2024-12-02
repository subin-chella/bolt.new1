import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Code2 } from 'lucide-react';

export default function LandingPage() {
  const [prompt, setPrompt] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim()) {
      navigate('/workspace', { state: { prompt } });
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
      <div className="max-w-3xl w-full text-center space-y-8">
        <div className="flex items-center justify-center space-x-3">
          <Code2 className="w-12 h-12 text-blue-500" />
          <h1 className="text-4xl font-bold">WebCraft AI</h1>
        </div>
        
        <p className="text-xl text-gray-400">
          Transform your ideas into stunning websites with the power of AI
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe your dream website..."
              className="w-full h-32 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>
          <button
            type="submit"
            className="px-8 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition-colors"
          >
            Generate Website
          </button>
        </form>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          {['Smart AI Generation', 'Real-time Preview', 'Export & Deploy'].map((feature) => (
            <div key={feature} className="p-6 bg-gray-800 rounded-lg">
              <h3 className="text-lg font-semibold">{feature}</h3>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}