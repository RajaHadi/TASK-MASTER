'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { getUser, logout, isAuthenticatedSync } from '@/src/lib/auth';
import { Button } from '@/src/components/ui/Button';

export function Navbar() {
  const pathname = usePathname();
  const user = getUser();
  const authenticated = isAuthenticatedSync();

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link href="/" className="flex-shrink-0 flex items-center">
              <span className="text-xl font-bold text-indigo-600 tracking-tight">TaskMaster</span>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            {authenticated && user ? (
              <>
                <Link 
                  href="/dashboard" 
                  className={`text-sm font-medium transition-colors ${
                    pathname === '/dashboard' ? 'text-indigo-600' : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  Dashboard
                </Link>
                <div className="h-6 w-px bg-gray-200 mx-2" aria-hidden="true" />
                <span className="text-sm text-gray-600 hidden sm:block">{user.email}</span>
                <Button
                  variant="secondary"
                  onClick={logout}
                  className="text-xs px-3 py-1.5 ml-2 border-gray-200"
                >
                  Sign Out
                </Button>
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
