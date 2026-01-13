'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { getUser, logout, isAuthenticatedSync } from '@/src/lib/auth';
import { Button } from '@/src/components/ui/Button';
import type { User } from '@/src/types';

export function Navbar() {
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    setUser(getUser());
    setAuthenticated(isAuthenticatedSync());
  }, []);

  // Get initials from email (e.g., "mannan@example.com" -> "M")
  const getInitials = (email: string) => {
    return email.charAt(0).toUpperCase();
  };

  return (
    <nav className="glass sticky top-0 z-50 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link href="/" className="flex-shrink-0 flex items-center gap-2 group">
              <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg p-1.5 shadow-lg group-hover:shadow-indigo-500/50 transition-all duration-300">
                <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <span className="text-lg sm:text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 tracking-tight">TaskMaster</span>
            </Link>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-4">
            {authenticated && user ? (
              <>
                <Link 
                  href="/dashboard" 
                  className={`text-sm font-medium transition-all duration-300 hidden sm:block ${
                    pathname === '/dashboard' 
                      ? 'text-white bg-white/10 px-3 py-2 rounded-md shadow-inner' 
                      : 'text-gray-400 hover:text-white px-3 py-2 hover:bg-white/5 rounded-md'
                  }`}
                >
                  Dashboard
                </Link>
                <div className="h-6 w-px bg-white/10 mx-2 hidden sm:block" aria-hidden="true" />
                
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-medium text-sm shadow-md ring-2 ring-white/10">
                    {getInitials(user.email)}
                  </div>
                  <Button
                    variant="secondary"
                    onClick={logout}
                    className="text-xs px-2 py-1.5 sm:px-3 bg-red-500/10 border-red-500/20 hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-all duration-300"
                  >
                    <span className="sm:hidden">Exit</span>
                    <span className="hidden sm:inline">Sign Out</span>
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2 sm:gap-3">
                <Link href="/login">
                  <Button variant="secondary" className="text-sm px-3 sm:px-4 bg-white/5 border-white/10 hover:bg-white/10 text-white">Log in</Button>
                </Link>
                <Link href="/signup">
                  <Button className="text-sm px-3 sm:px-4 bg-indigo-600 hover:bg-indigo-500 border-transparent shadow-lg shadow-indigo-500/20">Sign up</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
