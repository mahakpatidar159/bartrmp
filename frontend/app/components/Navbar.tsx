"use client";
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function Navbar() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) setUser(JSON.parse(stored));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/';
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <Link href="/" className="text-2xl font-extrabold text-indigo-600 tracking-tight">
            BARTR
          </Link>

          {/* Nav Links */}
          <div className="hidden sm:flex items-center gap-6">
            <Link href="/" className="text-sm font-medium text-gray-600 hover:text-indigo-600 transition">
              Home
            </Link>
            {user && (
              <>
                <Link href="/dashboard" className="text-sm font-medium text-gray-600 hover:text-indigo-600 transition">
                  Dashboard
                </Link>
                <Link href="/messages" className="text-sm font-medium text-gray-600 hover:text-indigo-600 transition">
                  Messages
                </Link>
                <Link href="/profile" className="text-sm font-medium text-gray-600 hover:text-indigo-600 transition">
                  My Profile
                </Link>
                {user.role === 'admin' && (
                  <Link href="/admin" className="text-sm font-medium text-red-500 hover:text-red-700 transition">
                    Admin
                  </Link>
                )}
              </>
            )}
            {!user && (
              <Link href="/admin" className="text-sm font-medium text-gray-600 hover:text-indigo-600 transition">
                Admin
              </Link>
            )}
          </div>

          {/* Auth Buttons */}
          <div className="flex items-center gap-3">
            {user ? (
              <>
                <span className="text-sm text-gray-500 hidden sm:block">
                  👋 {user.email.split('@')[0]}
                </span>
                <button
                  onClick={handleLogout}
                  className="bg-gray-100 text-gray-700 px-4 py-1.5 rounded-full text-sm font-medium hover:bg-gray-200 transition"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-indigo-600 transition">
                  Login
                </Link>
                <Link href="/register" className="bg-indigo-600 text-white px-4 py-1.5 rounded-full text-sm font-medium hover:bg-indigo-700 transition">
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
