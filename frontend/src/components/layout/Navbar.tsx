'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { getUser, logout, isAuthenticatedSync } from '@/src/lib/auth';
import { Button } from '@/src/components/ui/Button';

export function Navbar() {
  const pathname = usePathname();
  const user = getUser();
  const authenticated = isAuthenticatedSync();

  // Get initials from email (e.g., "mannan@example.com" -> "M")
  const getInitials = (email: string) => {
    return email.charAt(0).toUpperCase();
  };

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link href="/" className="flex-shrink-0 flex items-center gap-2">
              <div className="bg-indigo-600 rounded-lg p-1.5">
                <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <span className="text-xl font-bold text-gray-900 tracking-tight">TaskMaster</span>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            {authenticated && user ? (
              <>
                <Link 
                  href="/dashboard" 
                  className={`text-sm font-medium transition-colors ${
                    pathname === '/dashboard' 
                      ? 'text-indigo-600 bg-indigo-50 px-3 py-2 rounded-md' 
                      : 'text-gray-500 hover:text-gray-900 px-3 py-2'
                  }`}
                >
                  Dashboard
                </Link>
                <div className="h-6 w-px bg-gray-200 mx-2" aria-hidden="true" />
                
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center border border-indigo-200 text-indigo-700 font-medium text-sm">
                    {getInitials(user.email)}
                  </div>
                  <Button
                    variant="secondary"
                    onClick={logout}
                    className="text-xs px-3 py-1.5 border-gray-200 hover:bg-gray-50 text-gray-600"
                  >
                    Sign Out
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link href="/login">
                  <Button variant="secondary" className="text-sm">Log in</Button>
                </Link>
                <Link href="/signup">
                  <Button className="text-sm">Sign up</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
