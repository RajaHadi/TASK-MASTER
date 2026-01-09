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
      <div className="flex gap-3">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What needs to be done?"
          className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-4 py-3 border ${
            error ? 'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500' : ''
          }`}
          disabled={loading}
        />
        <Button
          type="submit"
          disabled={loading || !title.trim()}
          className="px-6"
        >
          {loading ? <LoadingSpinner size="sm" className="mr-2" /> : null}
          Add
        </Button>
      </div>
      {error && <p className="mt-2 text-sm text-red-600" id="email-error">{error}</p>}
    </form>
  );
}
