import type { Task } from '@/src/types';
import { LoadingSpinner } from '@/src/components/ui/LoadingSpinner';

export interface TaskItemProps {
  task: Task;
  onToggle?: (id: string, status: Task['status']) => void;
  onDelete?: (id: string) => void;
  updating?: boolean;
}

export function TaskItem({ task, onToggle, onDelete, updating }: TaskItemProps) {
  return (
    <div 
      className={`group bg-white p-4 sm:p-5 rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-indigo-100 hover:-translate-y-0.5 transition-all duration-200 ${
        task.status === 'completed' ? 'bg-gray-50/80' : ''
      }`}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          {onToggle && (
            <button
              onClick={() => onToggle(task.id, task.status)}
              disabled={updating}
              className={`flex-shrink-0 w-6 h-6 rounded-md border-2 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                task.status === 'completed'
                  ? 'bg-green-500 border-green-500 text-white'
                  : 'border-gray-300 hover:border-indigo-500 bg-white'
              }`}
            >
              {task.status === 'completed' && (
                <svg className="w-5 h-5 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>
          )}
          
          <div className="flex-1 min-w-0">
            <h3 className={`text-base font-medium truncate transition-colors ${
              task.status === 'completed' ? 'text-gray-400 line-through' : 'text-gray-900'
            }`}>
              {task.title}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-gray-400 flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {new Date(task.createdAt || Date.now()).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-200 transform translate-x-2 group-hover:translate-x-0">
          {onDelete && (
            <button
              onClick={() => onDelete(task.id)}
              disabled={updating}
              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
              title="Delete task"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h4a1 1 0 001 1v3M4 7h16" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
