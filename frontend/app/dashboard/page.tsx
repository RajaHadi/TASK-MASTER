'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { requireAuth } from '@/src/lib/auth';
import { api } from '@/src/lib/api-client';
import type { Task } from '@/src/types';
import { TaskList } from '@/src/components/task/TaskList';
import { TaskForm } from '@/src/components/task/TaskForm';
import { DeleteConfirmation } from '@/src/components/task/DeleteConfirmation';
import { LoadingSpinner } from '@/src/components/ui/LoadingSpinner';
import { ErrorMessage } from '@/src/components/ui/ErrorMessage';
import { EmptyState } from '@/src/components/ui/EmptyState';

export default function DashboardPage() {
  const router = useRouter();

  useEffect(() => {
    requireAuth();
  }, [router]);

  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [creatingTask, setCreatingTask] = useState(false);
  const [updatingTaskId, setUpdatingTaskId] = useState<string | null>(null);
  const [deleteTaskId, setDeleteTaskId] = useState<string | null>(null);
  const [deletingTask, setDeletingTask] = useState(false);

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      const { tasks } = await api.getTasks();
      setTasks(tasks);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (title: string) => {
    setCreatingTask(true);
    try {
      const task = await api.createTask(title);
      setTasks((prev) => [task, ...prev]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create task');
    } finally {
      setCreatingTask(false);
    }
  };

  const handleToggleTask = async (id: string, currentStatus: Task['status']) => {
    const newStatus = currentStatus === 'pending' ? 'completed' : 'pending';

    // Optimistic update
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, status: newStatus } : task
      )
    );

    setUpdatingTaskId(id);

    try {
      await api.updateTask(id, { status: newStatus });
    } catch (err) {
      // Rollback on error
      setTasks((prev) =>
        prev.map((task) =>
          task.id === id ? { ...task, status: currentStatus } : task
        )
      );
      setError(err instanceof Error ? err.message : 'Failed to update task');
    } finally {
      setUpdatingTaskId(null);
    }
  };

  const handleDeleteClick = (id: string) => {
    setDeleteTaskId(id);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTaskId) return;

    setDeletingTask(true);

    try {
      await api.deleteTask(deleteTaskId);
      setTasks((prev) => prev.filter((task) => task.id !== deleteTaskId));
      setDeleteTaskId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete task');
    } finally {
      setDeletingTask(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteTaskId(null);
  };

  const taskToDelete = deleteTaskId ? tasks.find((t) => t.id === deleteTaskId) : null;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <div className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="max-w-3xl mx-auto flex items-center justify-center py-20">
            <LoadingSpinner size="lg" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <div className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="max-w-3xl mx-auto">
            <ErrorMessage message={error} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8 md:flex md:items-center md:justify-between">
          <div className="flex-1 min-w-0">
            <h1 className="text-3xl font-bold leading-7 text-gray-900 sm:text-4xl sm:truncate">
              My Tasks
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage your daily goals and track your progress.
            </p>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6 mb-8 border border-gray-100">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Create New Task</h2>
          <TaskForm onSubmit={handleCreateTask} loading={creatingTask} />
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-900">Task List</h2>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
              {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'}
            </span>
          </div>

          {tasks.length === 0 ? (
            <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-12 text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No tasks</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by creating a new task above.</p>
            </div>
          ) : (
            <TaskList
              tasks={tasks}
              onToggle={handleToggleTask}
              onDelete={handleDeleteClick}
              updating={updatingTaskId !== null}
            />
          )}
        </div>

        {taskToDelete && (
          <DeleteConfirmation
            isOpen={deleteTaskId !== null}
            taskTitle={taskToDelete.title}
            onConfirm={handleDeleteConfirm}
            onCancel={handleDeleteCancel}
            loading={deletingTask}
          />
        )}
      </div>
    </div>
  );
}
