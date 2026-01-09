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
    <div className={`group bg-white p-4 sm:p-5 rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-indigo-100 transition-all duration-200 ${task.status === 'completed' ? 'bg-gray-50/50' : ''}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-1">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              task.status === 'completed' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-yellow-100 text-yellow-800'
            }`}>
              {task.status === 'completed' ? 'Completed' : 'In Progress'}
            </span>
            <span className="text-xs text-gray-400">
              {new Date(task.createdAt || Date.now()).toLocaleDateString()}
            </span>
          </div>
          <h3 className={`text-base font-medium truncate pr-4 ${task.status === 'completed' ? 'line-through text-gray-400' : 'text-gray-900'}`}>
            {task.title}
          </h3>
        </div>

        <div className="flex items-center gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
          {onToggle && (
            <button
              onClick={() => onToggle(task.id, task.status)}
              disabled={updating}
              className={`p-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                task.status === 'completed' 
                  ? 'text-gray-400 hover:text-gray-600 hover:bg-gray-100' 
                  : 'text-green-600 hover:text-green-700 hover:bg-green-50'
              }`}
              title={task.status === 'completed' ? 'Mark as pending' : 'Mark as completed'}
            >
              {updating ? (
                <LoadingSpinner size="sm" />
              ) : (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {task.status === 'completed' ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  )}
                </svg>
              )}
            </button>
          )}
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
