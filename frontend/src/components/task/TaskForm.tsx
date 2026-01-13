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
      <div className="flex flex-col sm:flex-row gap-3 group">
        <div className="relative flex-grow">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <span className="text-xl filter drop-shadow-md">📝</span>
          </div>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What needs to be done?"
            className={`block w-full rounded-xl border-white/10 shadow-inner focus:border-indigo-500/50 focus:ring-indigo-500/50 text-base py-4 pl-12 border bg-black/20 focus:bg-black/30 text-white placeholder-gray-500 transition-all duration-300 ${
              error ? 'border-red-500/50 text-red-200 placeholder-red-300/50 focus:ring-red-500/50' : 'hover:bg-black/25'
            }`}
            disabled={loading}
          />
        </div>
        <Button
          type="submit"
          disabled={loading || !title.trim()}
          className="w-full sm:w-auto px-8 py-4 rounded-xl text-base font-bold shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white border-0 transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0"
        >
          {loading ? <LoadingSpinner size="sm" className="mr-2 text-white" /> : 'Add Task'}
        </Button>
      </div>
      {error && <p className="mt-2 text-sm text-red-400 pl-1">{error}</p>}
    </form>
  );
}
