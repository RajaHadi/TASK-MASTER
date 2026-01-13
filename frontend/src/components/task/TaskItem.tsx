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
      className={`group glass p-4 sm:p-5 rounded-xl shadow-lg transition-all duration-300 ${
        task.status === 'completed' 
          ? 'bg-black/40 border-white/5' 
          : 'hover:bg-white/5 hover:border-indigo-500/30 hover:shadow-indigo-500/10 hover:-translate-y-1'
      }`}
    >
      <div className="flex items-center justify-between gap-3 sm:gap-4">
        <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
          {onToggle && (
            <button
              onClick={() => onToggle(task.id, task.status)}
              disabled={updating}
              className={`flex-shrink-0 w-6 h-6 rounded-lg border-2 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-indigo-500 flex items-center justify-center ${
                task.status === 'completed'
                  ? 'bg-emerald-500 border-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)] scale-105'
                  : 'border-white/20 hover:border-indigo-500 bg-transparent text-transparent hover:text-indigo-500/50'
              }`}
            >
              {task.status === 'completed' ? (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <div className="w-2 h-2 rounded-full bg-current opacity-0 hover:opacity-100 transition-opacity" />
              )}
            </button>
          )}
          
          <div className="flex-1 min-w-0">
            <h3 className={`text-sm sm:text-base font-medium truncate transition-all duration-300 ${
              task.status === 'completed' ? 'text-gray-500 line-through decoration-gray-600' : 'text-gray-200 group-hover:text-white'
            }`}>
              {task.title}
            </h3>
            <div className="flex items-center gap-2 mt-0.5 sm:mt-1">
              <span className="text-xs text-gray-500 group-hover:text-gray-400 transition-colors flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {new Date(task.createdAt || Date.now()).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  hour: 'numeric',
                  minute: 'numeric'
                })}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-300 sm:transform sm:translate-x-2 sm:group-hover:translate-x-0">
          {onDelete && (
            <button
              onClick={() => onDelete(task.id)}
              disabled={updating}
              className="p-1.5 sm:p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500/50"
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
