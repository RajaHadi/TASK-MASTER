'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { requireAuth, getUser } from '@/src/lib/auth';
import { api } from '@/src/lib/api-client';
import type { Task, User } from '@/src/types';
import { TaskList } from '@/src/components/task/TaskList';
import { TaskForm } from '@/src/components/task/TaskForm';
import { DeleteConfirmation } from '@/src/components/task/DeleteConfirmation';
import { LoadingSpinner } from '@/src/components/ui/LoadingSpinner';
import { ErrorMessage } from '@/src/components/ui/ErrorMessage';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    requireAuth();
    setUser(getUser());
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
  
  // Calculate stats
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const pendingTasks = tasks.filter(t => t.status === 'pending').length;
  
  // Get user name or default, stripping numbers
  const emailPrefix = user?.email?.split('@')[0] || 'there';
  const userNameOnlyAlphabets = emailPrefix.replace(/[^a-zA-Z]/g, '');
  const formattedName = userNameOnlyAlphabets.charAt(0).toUpperCase() + userNameOnlyAlphabets.slice(1);

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
        
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl mb-2">
            Good morning, {formattedName} 👋
          </h1>
          <p className="text-gray-500 text-lg">
            Here&apos;s what you need to get done today.
          </p>
        </div>

        {/* Stats Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-row sm:flex-col items-center justify-between sm:justify-center px-6 sm:px-4">
            <span className="text-sm font-medium text-gray-500 uppercase tracking-wide order-last sm:order-first">Total</span>
            <span className="text-2xl sm:text-3xl font-bold text-indigo-600 mb-0 sm:mb-1">{totalTasks}</span>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-row sm:flex-col items-center justify-between sm:justify-center px-6 sm:px-4">
            <span className="text-sm font-medium text-gray-500 uppercase tracking-wide order-last sm:order-first">Done</span>
            <span className="text-2xl sm:text-3xl font-bold text-green-600 mb-0 sm:mb-1">{completedTasks}</span>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-row sm:flex-col items-center justify-between sm:justify-center px-6 sm:px-4">
            <span className="text-sm font-medium text-gray-500 uppercase tracking-wide order-last sm:order-first">Pending</span>
            <span className="text-2xl sm:text-3xl font-bold text-orange-500 mb-0 sm:mb-1">{pendingTasks}</span>
          </div>
        </div>

        {/* Create Task Section */}
        <div className="bg-white shadow-sm rounded-2xl p-6 mb-8 border border-gray-100">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Create New Task</h2>
          <TaskForm onSubmit={handleCreateTask} loading={creatingTask} />
        </div>

        {/* Task List Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Task List</h2>
          </div>

          {tasks.length === 0 ? (
            <div className="bg-white shadow-sm rounded-2xl border border-gray-100 p-12 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-50 mb-4">
                <span className="text-2xl">🎉</span>
              </div>
              <h3 className="mt-2 text-lg font-medium text-gray-900">You&apos;re all caught up!</h3>
              <p className="mt-1 text-gray-500">Add a task above to stay productive.</p>
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
