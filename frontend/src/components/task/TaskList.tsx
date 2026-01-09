import type { Task } from '@/types';
import { TaskItem } from './TaskItem';

export interface TaskListProps {
  tasks: Task[];
  onToggle?: (id: string, status: Task['status']) => void;
  onDelete?: (id: string) => void;
  updating?: boolean;
}

export function TaskList({ tasks, onToggle, onDelete, updating }: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No tasks yet. Create your first task!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {tasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          onToggle={onToggle}
          onDelete={onDelete}
          updating={updating}
        />
      ))}
    </div>
  );
}
