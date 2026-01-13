import { InputHTMLAttributes, forwardRef } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  label?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', error, label, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-300 mb-1 ml-1">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`block w-full px-4 py-3 border border-white/10 rounded-xl shadow-inner placeholder-gray-500 text-white bg-black/20 focus:bg-black/30 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 sm:text-sm transition-all duration-200 ${
            error ? 'border-red-500/50 focus:ring-red-500/50 focus:border-red-500/50' : 'hover:bg-black/25 hover:border-white/20'
          } ${className}`}
          {...props}
        />
        {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
