'use client';

import { useState } from 'react';
import { Button } from '@/src/components/ui/Button';
import { LoadingSpinner } from '@/src/components/ui/LoadingSpinner';
import { validateTaskTitle } from '@/src/lib/validation';

export interface TaskFormProps {
  onSubmit: (title: string) => void;
  loading?: boolean;
}

export function TaskForm({ onSubmit, loading }: TaskFormProps) {
  const [title, setTitle] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateTaskTitle(title)) {
      setError('Task title is required');
      return;
    }

    setError('');
    onSubmit(title.trim());
    setTitle('');
  };

  return (
    <form onSubmit={handleSubmit} className="relative">
      <div className="flex gap-3 group">
        <div className="relative flex-grow">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <span className="text-xl">📝</span>
          </div>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What needs to be done?"
            className={`block w-full rounded-xl border-gray-200 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-base py-4 pl-12 border bg-gray-50/50 focus:bg-white text-gray-900 transition-all duration-200 ${
              error ? 'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500' : ''
            }`}
            disabled={loading}
          />
        </div>
        <Button
          type="submit"
          disabled={loading || !title.trim()}
          className="px-8 py-4 rounded-xl text-base font-medium shadow-sm hover:shadow-md transition-all duration-200"
        >
          {loading ? <LoadingSpinner size="sm" className="mr-2" /> : 'Add Task'}
        </Button>
      </div>
      {error && <p className="mt-2 text-sm text-red-600 pl-1">{error}</p>}
    </form>
  );
}
