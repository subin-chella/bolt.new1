import React from 'react';
import { Code, Eye } from 'lucide-react';

interface TabsContainerProps {
  activeTab: 'code' | 'preview';
  onTabChange: (tab: 'code' | 'preview') => void;
  children: React.ReactNode;
}

export default function TabsContainer({ activeTab, onTabChange, children }: TabsContainerProps) {
  return (
    <div className="h-full flex flex-col bg-gray-800 rounded-lg overflow-hidden">
      <div className="flex border-b border-gray-700">
        <button
          className={`flex items-center space-x-2 px-4 py-2 ${
            activeTab === 'code'
              ? 'text-blue-400 border-b-2 border-blue-400'
              : 'text-gray-400 hover:text-gray-300'
          }`}
          onClick={() => onTabChange('code')}
        >
          <Code className="w-4 h-4" />
          <span>Code</span>
        </button>
        <button
          className={`flex items-center space-x-2 px-4 py-2 ${
            activeTab === 'preview'
              ? 'text-blue-400 border-b-2 border-blue-400'
              : 'text-gray-400 hover:text-gray-300'
          }`}
          onClick={() => onTabChange('preview')}
        >
          <Eye className="w-4 h-4" />
          <span>Preview</span>
        </button>
      </div>
      <div className="flex-1 overflow-hidden">
        {children}
      </div>
    </div>
  );
}