'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/src/components/ui/Input';
import { Button } from '@/src/components/ui/Button';
import { LoadingSpinner } from '@/src/components/ui/LoadingSpinner';
import { ErrorMessage } from '@/src/components/ui/ErrorMessage';
import { signUpWithBetterAuth } from '@/src/lib/auth';
import { validateEmail, validatePassword } from '@/src/lib/validation';

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Clear previous errors
    setEmailError('');
    setPasswordError('');
    setError('');

    // Validate inputs
    if (!email) {
      setEmailError('Email is required');
      return;
    }
    if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address');
      return;
    }
    if (!password) {
      setPasswordError('Password is required');
      return;
    }
    if (!validatePassword(password)) {
      setPasswordError('Password must be at least 8 characters');
      return;
    }

    setLoading(true);

    try {
      // Use Better Auth for signup
      await signUpWithBetterAuth(email, password);
      router.push('/dashboard');
    } catch (err) {
      setLoading(false);
      const errorMessage = err instanceof Error ? err.message : 'Signup failed';
      
      if (errorMessage.toLowerCase().includes('already exists') || errorMessage.toLowerCase().includes('email')) {
        setError('User already exists. Please sign in instead.');
      } else {
        setError(errorMessage);
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 animate-fade-in relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-600/20 blur-[100px] animate-pulse-slow"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-purple-600/20 blur-[100px] animate-pulse-slow" style={{ animationDelay: '1.5s' }}></div>
      </div>

      <div className="max-w-md w-full space-y-8 animate-slide-up">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20 mb-6 transform hover:rotate-6 transition-transform duration-300">
             <span className="text-3xl">🚀</span>
          </div>
          <h2 className="text-4xl font-extrabold text-white tracking-tight mb-2">
            Create account
          </h2>
          <p className="mt-2 text-sm text-gray-400">
            Already have an account?{' '}
            <a href="/login" className="font-medium text-indigo-400 hover:text-indigo-300 transition-colors">
              Sign in
            </a>
          </p>
        </div>

        {error && <ErrorMessage message={error} />}

        <form onSubmit={handleSubmit} className="mt-8 space-y-6 glass p-8 rounded-2xl shadow-2xl">
          <Input
            type="email"
            label="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={emailError}
            placeholder="you@example.com"
            required
          />

          <Input
            type="password"
            label="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={passwordError}
            placeholder="•••••••••"
            required
            minLength={8}
          />

          <Button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 text-base font-bold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-lg shadow-indigo-500/25 border-0 rounded-xl transition-all duration-300 transform hover:-translate-y-0.5"
          >
            {loading ? <LoadingSpinner size="sm" className="mr-2 text-white" /> : 'Create account'}
          </Button>
        </form>
      </div>
    </div>
  );
}
