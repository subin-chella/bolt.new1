import React from 'react';
import { CheckCircle, Circle, Loader } from 'lucide-react';
import { Step } from '../../types';

interface StepsListProps {
  steps: Step[];
}

export default function StepsList({ steps }: StepsListProps) {
  const getStatusIcon = (status: Step['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'in-progress':
        return <Loader className="w-5 h-5 text-blue-500 animate-spin" />;
      default:
        return <Circle className="w-5 h-5 text-gray-500" />;
    }
  };

  return (
    <div className="h-full bg-gray-800 p-4 rounded-lg">
      <h2 className="text-lg font-semibold mb-4">Build Steps</h2>
      <div className="space-y-4">
        {steps.map((step) => (
          <div
            key={step.id}
            className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-700"
          >
            {getStatusIcon(step.status)}
            <div>
              <h3 className="font-medium">{step.title}</h3>
              <p className="text-sm text-gray-400">{step.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}